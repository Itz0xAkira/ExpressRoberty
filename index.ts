import express, { Express, Request, Response , Application } from 'express';
import { openai } from "./utils/openai";
import { functionlist } from './utils/openaiFunctions';
import { PineconeClient } from '@pinecone-database/pinecone';
import { PineconeStore } from "langchain/vectorstores/pinecone";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { OpenAI } from "langchain/llms/openai";
import { VectorDBQAChain } from "langchain/chains";
import { CallbackManager } from "langchain/callbacks";
import { LangChainStream } from "ai"
import dotenv from 'dotenv';
import bodyParser from 'body-parser';

//For env File 
dotenv.config();

const def_prompt = `You are an AirBnB and Booking.com host and property manager, your name is Gabriel, you are working with guests to make sure they have an amazing stay, provide information about the property and the activities which can be done on their vacation. Your tone is a cool relatable experienced local who has wit and a slight yes professional sense of humor.

Ask the guests if they have any specific questions. Keep your answers to the point, providing the most amount of information in related to the question in the least amount of text, however you can be detailed about the information you have and answer the question fully. Remember your main goal is to help the guests find out the right information.

` 
const OrderRequest = (str :  string) =>{
    console.log(str)
    return {role : 'assistant', content : "Here is your food"} as any
}


const EmbedQuestion = async ( str : string) => {
}

const app: Application = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true,
}))
const port = process.env.PORT || 8000;

app.post('/api/chat' ,async (req, res) => {

    const messages  = await req.body.messages;
    console.log(messages)

    try {
        // console.log(msg)
        if(messages[0].role == "user"){
            messages.unshift({
                role: "system",
                content:
                  def_prompt,
              })
        }
        // Request the OpenAI API for the response based on the prompt
        const response = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: 
            messages,
            temperature: 0.5,
            max_tokens: 150,
            functions: functionlist,
            function_call: "auto",
        });
    
        const completionRes = response.choices[0].finish_reason;
    
        // console.log(completionRes)
    
        if(completionRes == "function_call"){
            const funcName = response.choices[0].message.function_call?.name;
            const funcParam = response.choices[0].message.function_call?.arguments;    
    
            switch (funcName) {
                case "OrderRequest":
                  const req = await OrderRequest(funcParam as string);
                  res.status(200).json({ message: req.content });
                case "SelfCheckIn":
                  const anser = await EmbedQuestion(funcParam as string);
                  // return new StreamingTextResponse(anser.content)
                  break;
                case "CheckDate":
                //   CheckDate(args)
                  break;
                default:
                  break;
              }
    
        }
        else{
          const { stream, handlers } = LangChainStream();
          const pineconeClient = new PineconeClient();
          await pineconeClient.init({
            apiKey: process.env.PINECONE_API_KEY ?? "",
            environment: "us-west4-gcp-free",
          });
          const pineconeIndex = pineconeClient.Index(
            process.env.PINECONE_INDEX_NAME as string
          );
    
          //rollback
          const vectorStore = await PineconeStore.fromExistingIndex(
            new OpenAIEmbeddings(),
            { pineconeIndex }
          );
    
          const model = new OpenAI({
            modelName: "gpt-4",
            streaming: false,
            callbackManager: CallbackManager.fromHandlers(handlers),
            temperature:0.6,
            
          });
        
          // Define the Langchain chain
          const chain = VectorDBQAChain.fromLLM(model, vectorStore,  {
            k: 1,
            returnSourceDocuments: false,
          });
    
          // console.log(messages[messages.length-1].content)
        
          // Call our chain with the prompt given by the user
          const msg = await chain.call({ query : messages[messages.length-1].content.concat(def_prompt)} );
    
          // console.log(msg)
            // messages.push(response.choices[0].message)
            // const i = messages.length;
            // console.log(messages[i-1])
          res.status(200).json({ message: msg.text });
        }
      } catch (error: any) {
        console.log('error', error);
        res.status(500).json({ error: error.message || 'Something went wrong' });
      }
  });

app.listen(port, () => {
  console.log(`Server is Fire at http://localhost:${port}`);
})