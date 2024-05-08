import fetch from "node-fetch";
import { ChatThreadModel, UserPrompt } from "../models";

export const apicall = async (req: Request) => {

 
  // sending request to the api
  const body = await req.json();
  var api_url = new URL(`${process.env.API_URL!}?fips_code=${body.fips_code}`);
  var token= process.env.API_URL!
  const response = await fetch(api_url, {
    method: "get",
    headers: {"X-API-TOKEN":token },
  });

  var result=await response.json()
  console.log(result)
  let x = Object.entries(result);
  let y = x.slice(0,20); 
  const obj = Object.fromEntries(y);

  return new Response(JSON.stringify(obj));
  
};