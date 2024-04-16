import dotenv from 'dotenv';
import process from 'node:process';
import fetch from 'node-fetch';
import OpenAI from 'openai';

dotenv.config({ path: '.dev.vars' });

process.env.OPENAI_API_KEY = process.env.OPENAI_API_KEY 
process.env.TINY_HOST = process.env.TINY_HOST || 'https://plugin.findmentor.org';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function runConversation(messages) {
    const lastMessage = messages[messages.length - 1];

    const retrieval = await fetch(`${process.env.TINY_HOST}/retrieve?text=${encodeURIComponent(lastMessage.content)}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Key ${process.env.TINY_API_KEY}`
        }
    }).then(response => response.json());

    messages.push({
        role: "assistant",
        content: `Here's what I retrieved: ${JSON.stringify(retrieval)}`
    });

    const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: messages
    });

    const responseMessage = response.choices[0].message.content;
    return responseMessage;
}

export async function fetchChatGPTResponse(message) {
    const messages = [{ role: "user", content: message }];
    const responseMessage = await runConversation(messages);
    return responseMessage;
}

export async function handleChatCommand(userMessage) {
    return await fetchChatGPTResponse(userMessage);
}
