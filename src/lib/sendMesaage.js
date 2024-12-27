import { writable } from "svelte/store";

export let message = writable([])

export async function sendInput( response, isLoading=true) {
    message.update((msg) => [
        ...msg,
        {role: "user", content: message}
    ])
    
    try{
        const res = await fetch("/api/chat", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                message: get(message)
            })

        })

        const reader = res.body.getReader()
        const decoder = new TextDecoder()

        while (true){
            const { done, value} = await reader.read()
            if(done) break
            response += decoder.decode(value, { stream: true})

            message.update((msgs) => [
                ...msgs,
                {role: "assistant", content: response}
            ])
        }
        
    } catch(err){
        response = `Error: ${err.message}`
    } finally {
        isLoading = false
    }
}   