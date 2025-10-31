# Om
Detta projekt är ett bokningssystem för ett coworkingcenter där man kan boka skrivbord, mötesrum, etc med realtidsuppdatering.

# Teknisk information
## Ramverk och bibliotek
- React
- Tailwind
- ASP.NET Core Web API
- MySQL
- SignalR 
- OpenAI

## Annat
- Frontend körs på [http://localhost:5173](http://localhost:5173)
- Backend körs på [http://localhost:5296](http://localhost:5296)
- Använder RESTful API.
- Använder JWT-token för autentisering.

## AI
På "booking page" finns en AI assistent som svara på frågor om tillgänlighet av resurserna.
Den skickar meddelandet till backend som sedan skickar den till OpenAI:s API. Det skickas också med en beskrivning av funktionen GetBookingsByResourceType.
Funktionen skickar tillbaka aktiva bokningar. När AI:n behöver bokningarna skickas ett "function call" till backend vilket sedan skickar resultaten av funktionen till Open AIs API.
Sedan skickas API:ets svar på användarens meddelande.

# Instruktioner för lokalt appbyggande
## Nödvändiga installationer
- .NET 8 eller 9
- Node.js & npm
- MySQL

## Databas
- Skapa en MySQL connection.

## Miljövariabler
- Skapa en .env fil i backend.
- Lägg till variabeln SQL_CONNECTION_STRING med värdet av din SQL connection i formatet "Server=SQL_Server;Database=SQL_Database;User="SQL_User";Password=SQL_Password".
- (Valfritt) Lägg till variabeln OPENAI_API_KEY med värdet av en OPENAI api-nyckel. Detta krävs för att använda AI-assistenten.
- Skapa en .env fil i frontend.
- Lägg till variabeln VITE_API_URL med värdet av länken till backend. Default är "http://localhost:5296".

## Starta applikationen
```
cd backend
dotnet restore
dotnet ef database update
dotnet run
```

```
cd frontend
npm install
npm run dev
```

## Användare
För att boka måste du logga in. <br />
Du kan skapa en ny användare eller logga in med admin kontot. <br />
Admins kan använda admin tools genom att gå in på [http://localhost:5173/admin](http://localhost:5173/admin) <br />

**Admin konto:** <br />
**E-post: admin@innoviahub.com**, <br />
**Lösenord: Admin123!**

# Endpoints
<details>

<summary> Authentication endpoints </summary> 

**GET**
**/api/auth/health**

Returnerar statuskod 400 om API:et fungerar.

**POST**
**/api/auth/register** <br />
Body: <br />
string Email, <br />
string FirstName, <br />
string LastName, <br />
string Password, <br />
string ConfirmPassword

Skapar en ny användare med rollen "Member".

**POST**
**/api/auth/login** <br />
Body: <br /> 
string Email, <br /> 
string Password 

Loggar in användare och returnerar JWT-token.

**POST**
**api/auth/logout**

Loggar ut användare.

**GET**
**api/auth/profile** <br />
Autentisering: Member

Returnerar hela objektet av användaren som loggar in.

**PUT**
**/api/auth/profile** <br />
Autentisering: Member <br />
Body: <br />
string FirstName <br /> 
string LastName 

Ändrar FirstName och LastName av användaren som loggar in.

**POST**
**/api/auth/refresh-token** <br />
Autentisering: Member <br />
Body: <br />
string Token

Uppdaterar och returnerar token.

</details>

<details>

<summary> Booking endpoints </summary> 


**GET**
**/api/bookings/** <br />
Autentisering: Admin, Member <br />

Returnerar alla bokningar.

**GET**
**/api/bookings/{bookingId}** <br />
Autentisering: Admin, Member

Returnerar bokning som motsvarar id.

**GET**
**/api/bookings/myBookings** <br />
Autentisering: Admin, Member <br />
Body: <br />
bool includeExpiredBookings (default är false)

Returnerar alla aktiva bokningar som tillhör användaren. Måste specificera om man vill inkludera inaktiva bokningar.

**GET**
**/api/bookings/getByResource/{resourceId}** <br />
Autentisering: Admin, Member <br />
Body: <br />
bool includeExpiredBookings (default är false)

Returnerar alla aktiva bokningar som tillhör en resurs. Måste specificera om man vill inkludera inaktiva bokningar.

**POST**
**/api/bookings** <br />
Autentisering: Admin, Member <br />
Body: <br /> 
int ResourceId <br /> 
DateTime BookingTime <br />
string Timeslot (måste vara "FM" eller "EF")

Skapar en bokning. Tiden på "BookingTime" ersätts av "8:00" eller "12:00" beroende på timeslot.

**PUT**
**/api/bookings** <br /> 
Autentisering: Admin <br />
Body: <br />
int BookingId, <br />
bool IsActive, <br /> 
DateTime BookingDate, <br />
DateTime EndDate, <br />
string UserId, <br />
int ResourceId

Uppdaterar bokning.

**POST**
**/api/bookings/cancel/{bookingId}** <br />
Autentisering: Admin, Member <br />

Tar bort bokning som motsvarar "bookingId". <br />
Members kan bara ta bort sina egna bokningar och Admins kan ta bort vilken bokning som helst. <br />
Bokningar som har gått ut kan inte tas bort.

**POST**
**/api/bookings/delete/{bookingId}** <br />
Autentisering: Admin

Tar bort bokning.

</details>

<details>

<summary> Resource endpoints </summary> 

**GET**
**/api/bookings/resources** <br />
Autentisering: Admin, Member

Returnerar alla resurser.

**GET**
**api/resources/{resourceId}** <br />
Autentisering: Admin, Member

Returnerar resurs som motsvarar id.

**POST**
**api/resources** <br />
Autentisering: Admin <br />
Body: <br />
int ResourceTypeId (1 = DropInDesk, 2 = MeetingRoom, 3 = VRset, 4 = AIserver), <br />
string Name

Skapar en ny resurs.

**PUT**
**api/resources/{resourceId}** <br />
Autentisering: Admin <br />
Body: <br />
int ResourceTypeId (1 = DropInDesk, 2 = MeetingRoom, 3 = VRset, 4 = AIserver), <br />
string Name, <br />
bool IsBooked

Uppdaterar resursen som motsvarar id.

**DELETE**
**api/resources/{resourceId}** <br />
Autentisering: Admin

Tar bort resurs.

</details>
