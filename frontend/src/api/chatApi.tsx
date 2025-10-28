// URL for API
const API_URL = import.meta.env.VITE_API_URL;

export async function sendChatMessage(message: string): Promise<string>
{
    const res = await fetch(`${API_URL}/api/chat`, 
    {
        method: "POST",
        headers: 
        {
            "Content-Type": "application/json",
            "Accept": "application/json"
        },
        body: JSON.stringify({ message: message }),
    });
    if (!res.ok) throw new Error("Error");
    return await res.json();
}