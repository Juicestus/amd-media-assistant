// -- HANDLE TTS -- 

import * as sdk from "microsoft-cognitiveservices-speech-sdk";

var speechConfig = sdk.SpeechConfig.fromSubscription(process.env['AZURE_TTS_KEY'], "eastus");
speechConfig.speechSynthesisVoiceName = "en-US-AndrewMultilingualNeural";

export const generateTTS = async (text: string, filename: string, onComplete: () => void) => {
    var audioConfig = sdk.AudioConfig.fromAudioFileOutput(filename);
    var synthesizer = new sdk.SpeechSynthesizer(speechConfig, audioConfig);

    console.log("Making TTS request on file ID " + filename + " for " + text.length + " characters");
    
    synthesizer.speakTextAsync(text, result => {
        if (result.reason == sdk.ResultReason.SynthesizingAudioCompleted) {
            console.log("Synthesis for file ID " + filename + " finished");
            onComplete();
            synthesizer.close();
        } else {
            console.error("Error synthesizing audio for file ID " + filename + ": " + result.errorDetails);
            synthesizer.close();
        }
    });
}
// -- HANDLE BLOB -- 

import { BlobServiceClient } from "@azure/storage-blob";

const blobServiceClient = BlobServiceClient.fromConnectionString(process.env["AzureBlobConnectionString"]);

const containerClient = blobServiceClient.getContainerClient("tts");

export const uploadTTS = async (filename: string) => {
    const blockBlobClient = containerClient.getBlockBlobClient(filename);
    const uploadBlobResponse = await blockBlobClient.uploadFile(filename);
    console.log(`Uploaded block blob ${filename} successfully`, uploadBlobResponse.requestId);
}
