interface Ai_inputProps 
{
    submitNewMessage: () => void;
    setNewMessage: (message: string) => void
    newMessage: string
    isLoading: boolean
}

const Ai_input = ({ submitNewMessage, setNewMessage, newMessage, isLoading }: Ai_inputProps) => 
{
    return (
        <>
            {isLoading ? <p className="ml-1">Laddar...</p> : null}
            <div className="mt-auto flex justify-between">
                <input
                    className="border"
                    placeholder="Ask a question..."
                    value={newMessage}
                    onChange={e => setNewMessage(e.target.value)}
                />

                <button onClick={submitNewMessage} className="border pl-1 pr-1 w-15">Send</button>
            </div>
        </>
    );
}

export default Ai_input;