export async function sendChatMessage(message: string): Promise<string>
{
    const res = await fetch(`http://localhost:5296/api/chat`, 
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