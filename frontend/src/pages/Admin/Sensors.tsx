import {
  fetchDevices,
  fetchMeasurements,
  fetchTenant,
} from "../../hooks/useApi";
import { useAdminAuth } from "../../context/AdminAuthProvider";
import { useEffect, useState } from "react";
import * as signalR from "@microsoft/signalr";

const Sensors: React.FC = () => {
  type Device = 
  {
    id: string,
    model: string,
    roomId: null,
    serial: string,
    status: string,
    tenantId: string
  };

  type Measurement =
  {
    deviceId: string
    type: string,
    value: Number
  };

  useAdminAuth();
  // Hooks
  var [tenantId, setTenantId] = useState("");
  var [devices, setDevices] = useState<Device[]>([]);
  var [measurements, setMeasurements] = useState<Measurement[]>([]);
  var [deviceError, setDeviceError] = useState(false);
  var [measurementError, setMeasurementError] = useState(false);

  function capitalizeFirstLetter(val: string) 
  {
    return String(val).charAt(0).toUpperCase() + String(val).slice(1);
  }

  //SignalR
  useEffect(() => 
  {
    const connection = new signalR.HubConnectionBuilder()
      .withUrl("http://localhost:5103/hub/telemetry")
      .build();

    async function startSignalR()
    {
      await connection.start();
      await connection.invoke("JoinTenant", "innovia");
      connection.on("measurementReceived", data => replaceMeasurement
      ({
        deviceId: data.deviceId, 
        type: capitalizeFirstLetter(data.type), 
        value: Math.round(data.value)
      }));
    }

    startSignalR();

    return () => 
    {
      connection?.off("measurementReceived");
      connection?.stop();
    };
  }, [])

  //Fetching tenant and devices
  useEffect(() => 
  {
    fetchTenant("innovia")
    .then(res => 
    {
      setTenantId(res.id)

      fetchDevices(res.id)
      .then(res => 
      {
        setDevices(res);
      })
    })
    .catch(error => 
    {
      setDeviceError(true);
    })
  }, [])

  //Fetching measurements
  useEffect(() => 
  {
    async function loadMeasurements()
    {
      //Creates promises for measurements.
      const promises = devices.map(async (device) => 
      {
        const res = await fetchMeasurements(tenantId, device.id);

        const measurements: Measurement[] = [];

        for (let i = 0; i < res.length; i++) 
        {
          measurements.push
          ({
            deviceId: device.id,
            type: capitalizeFirstLetter(res[i].type),
            //Leaves one decimal
            value: Math.round(res[i].value * 10) / 10
          });
        }

        return measurements;
      })

      const results = await Promise.all(promises)
      .then(res => 
      {
        setMeasurements(res.flat());
      })
      .catch(() => 
      {
        setMeasurementError(true);
      })
    };

    loadMeasurements();
  }, [devices])

  function replaceMeasurement(replacement: Measurement)
  {
    setMeasurements(measurements => [ replacement, ...measurements.filter(m => !(m.deviceId === replacement.deviceId && m.type === replacement.type)) ]);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 ">
              Sensor Management
            </h1>
            <p className="text-gray-600  mt-1">
              Manage sensors and their availability
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {
          deviceError ? 
          (
            <div className="col-span-full p-12 text-center">
              <div className="text-red-500 text-6xl mb-4"></div>
              <p className="text-red-600">
                Couldn't fetch sensors.
              </p>
            </div>
          )
          :
          devices.map((device: Device) => 
          (
            <div
              key={device.id}
              className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <div className="ml-3">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {device.serial}
                    </h3>
                    <p className="text-base text-gray-500">
                      {device.model}
                    </p>
                    {
                      measurementError ?
                      <p>Couldn't fetch measurements.</p>
                      :
                      measurements.length == 0 ? 
                        <p>Loading...</p>
                        : 
                        measurements.map((item: Measurement) => 
                        (
                          item.deviceId == device.id && device.status == "active" ? <p>{item.type}: {item.value}</p> : null
                        ))
                      }
                    
                  </div>
                </div>
                <span
                  className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                    device.status == "active"
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {device.status == "active" ? "Active" : "Inactive"}
                </span>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default Sensors;