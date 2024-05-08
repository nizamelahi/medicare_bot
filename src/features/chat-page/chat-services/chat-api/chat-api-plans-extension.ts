import fetch from "node-fetch";
import { ChatThreadModel, UserPrompt } from "../models";

export const apicall = async (req: Request) => {

 
  // sending request to the api
  const body = await req.json();
  var api_url = new URL(`${process.env.API_URL!}?fips_code=${body.fips_code}`);
  const response = await fetch(api_url, {
    method: "get",
    headers: {"X-API-TOKEN":"c454c6e2bbfe30c5d8c6247a5b400835df43a1b6e4aaf6b4fd82e0ac74091c3f" },
  });

  var result=await response.json()
  console.log(result)
  let x = Object.entries(result);
  let y = x.slice(0,20); 
  const obj = Object.fromEntries(y);
  
  return new Response(JSON.stringify(obj));
  
};