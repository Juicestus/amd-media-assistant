import * as openai from 'openai';

const API_KEY = process.env["OPENAI_API_KEY"];
const ASST_ID = process.env["OPENAI_ASSISTANT_ID"];

let ai: openai.OpenAI | null = null;
let threadID: string | null = null;

export async function initLLMIfNull() {
    if (ai === null) {
        ai = new openai.OpenAI({ apiKey: API_KEY });
        threadID = (await ai.beta.threads.create()).id;
    }
}

export const sendMessage = async (prompt: string) => {
    const myThreadMessage = await ai.beta.threads.messages.create(
        threadID,
        {
            role: "user",
            content: prompt,
        }
    );
}

export const beginResponse = async () => {
    const run = await ai.beta.threads.runs.create(
        threadID,
        {
            assistant_id: ASST_ID,
            instructions: ""
        }
    );
    return run;
}

export const getResult = async (run: any) => {
    let keepRetrievingRun;

    while (run.status === "queued" || run.status === "in_progress") {
        keepRetrievingRun = await ai.beta.threads.runs.retrieve(
            threadID,
            run.id
        );
        console.log(`Run status: ${keepRetrievingRun.status}`);

        if (keepRetrievingRun.status === "completed") {
            console.log("\n");

            // Step 6: Retrieve the Messages added by the Assistant to the Thread
            const allMessages = await ai.beta.threads.messages.list(threadID);

            return Promise.resolve(allMessages.data[0].content);

            break;
        } else if (
            keepRetrievingRun.status === "queued" ||
            keepRetrievingRun.status === "in_progress"
        ) {
            // pass
        } else {
            console.log(`Run status: ${keepRetrievingRun.status}`);
            break;
        }
    }
};

