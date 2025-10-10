import type { ChatMessage } from "./AI_assistant";

interface Ai_messagesProps 
{
    messages: ChatMessage[];
    isLoading: boolean;
}

const Ai_messages = ({ messages }: Ai_messagesProps) => 
{
    return (
        <div className="overflow-y-scroll">
            {messages.map((message) => 
            (
                message.role == "user" 
                ? 
                <div className="m-1 ml-auto bg-blue-500 rounded-xl w-fit min-w-20">
                    <p className="text-white ml-2 mr-2">{message.content}</p>
                </div> 
                : 
                <div className="m-1 mr-auto bg-purple-500 rounded-xl w-fit min-w-20 max-w-40">
                    <p className="text-white ml-2 mr-2">{message.content}</p>
                </div>
            ))}
        </div>
    );
}

export default Ai_messages;