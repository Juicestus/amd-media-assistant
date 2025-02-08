import { app, HttpRequest, HttpResponseInit, InvocationContext, Timer, output, input } from "@azure/functions";
import { deleteTTS } from "../internal/tts";
import { Article } from "../data";
import { articleContainerInterface, queryArticleForDeletion } from "./article";

const DELTA_T = 1000 * 60 * 60 * 0; // 24 hours

export async function timerTrigger(tim: Timer, context: InvocationContext): Promise<void> {

    (context.extraInputs.get(queryArticleForDeletion) as Partial<Article>[]).map(a => {
        console.log(`Scanning article ${a.id} for deletion...`)
        console.log(`| timestamp difference: ${Date.now() - a.timestamp}`);
        if (Date.now() - a.timestamp > DELTA_T) {
            console.log(`| > ${DELTA_T}... marked for deletion!`);
            try { // try to delete the article from cosmosdb
                articleContainerInterface.item(a.id, a.id).delete();
            } catch (error) {
                console.log("Error deleting article with ID " + a.id);
            }
            deleteTTS(a.key + "-title.wav");
            deleteTTS(a.key + "-content.wav");
        } else {
            console.log(`| < ${DELTA_T}... marked as safe.`);
        }
    });

}

// app.timer('timerTriggerCleanerProcess', {
//     // schedule: '*/30 * * * * *',  // every 30 seconds
//     schedule: '0 */4 * * *',     // every 4 hours
//     runOnStartup: true,
//     handler: timerTrigger,
//     extraInputs: [queryArticleForDeletion],
//     extraOutputs: []
// });
