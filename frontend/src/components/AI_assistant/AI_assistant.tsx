import { sendChatMessage } from "@/api/chatApi";
import Ai_input from "./AI_input";
import Ai_messages from "./AI_messages";
import { useState } from "react";

export class ChatMessage
{
    role: string;
    content: string;

    constructor(role: string, content: string)
    {
        this.role = role,
        this.content = content
    }
}

const Ai_assistant = () => 
{
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [newMessage, setNewMessage] = useState("")
    const [isLoading, setIsLoading] = useState(false);
    const [assistantVisible, setAssistantVisible] = useState(true);

    async function submitNewMessage() 
    {
        var newMessages = messages;
        newMessages.push(new ChatMessage("user", newMessage));

        setIsLoading(true);

        var response = await sendChatMessage(newMessage);
        newMessages.push(new ChatMessage("system", response));

        setMessages(newMessages);
        setIsLoading(false);
    }

    return (
        <>
            {
                assistantVisible ?
                <div id="ai_assistant_root" className={`border bg-white flex flex-col max-w-60 min-w-60 max-h-80 min-h-80`}>
                    <div className="border-b flex justify-between">
                        <span className="ml-1">AI assistant</span>

                        <button className="border-l pl-2 pr-2 bg-red-500" onClick={() => setAssistantVisible(false)}><b>-</b></button>
                    </div>

                    <Ai_messages
                        messages={messages}
                        isLoading={isLoading}
                    />

                    <Ai_input
                        submitNewMessage={submitNewMessage}
                        setNewMessage={setNewMessage}
                        newMessage={newMessage}
                        isLoading={isLoading}
                    />
                </div>
                :
                <div className="bg-blue-500 text-white p-5">
                    <button onClick={() => setAssistantVisible(true)}>Assistant</button>
                </div>
            }
        </>
    );
}

export default Ai_assistant;