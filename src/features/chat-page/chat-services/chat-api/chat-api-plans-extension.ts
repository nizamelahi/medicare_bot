import fetch from "node-fetch";
import fs from "fs";

export const apicall = async (req: Request) => {
  var token_update_time = 4
  console.log("request recieved")
  
  var current_time = Date.now()
  try {

    var file_data = fs.readFileSync('token_info',
      { encoding: 'utf8', flag: 'r' });
    var token_info = JSON.parse(file_data);

  } catch (error) {
    console.log(error)
    var file_data = ""
    token_info = { last_update_time: "0", token: "" }
  }

  try {

    var file_data = fs.readFileSync('zip-to-fips.json',
      { encoding: 'utf8', flag: 'r' });
    var zip_to_fips = JSON.parse(file_data);

  } catch (error) {
    console.log(error)
    return new Response("error loading zip mapping file")
  }


  var last_update_time = parseInt(token_info["last_update_time"])
  var token = token_info["token"]

  var hours_diff = (current_time - last_update_time) / (1000 * 3600)

  if (hours_diff > token_update_time) {
    const auth_body = { api_key: process.env.API_KEY!, portal_name: process.env.PORTAL_NAME! };
    var auth_url = new URL(`${process.env.AUTH_URL!}`);


    const response = await fetch(auth_url, {
      method: "post",
      body: JSON.stringify(auth_body),
    });

    var auth_resp = await response.json();
    token = auth_resp["token"]

    token_info["last_update_time"] = Date.now()
    token_info["token"] = token

    fs.writeFileSync('token_info', JSON.stringify(token_info));

  }

  // plan_entity api
  const body = await req.json();
  if (body.plan_id) {
    var api_url = new URL(`${process.env.PLAN_ENTITY_URL!}${body.plan_id}`);

    var api_req_start_time = Date.now()
    const response = await fetch(api_url, {
      method: "get",
      headers: { "X-API-TOKEN": token },
    });

    var api_req_end_time = Date.now()
    var api_time = (api_req_end_time - api_req_start_time) / 1000
    console.log(`api time = ${api_time} seconds`)

    var result = await response.json();
    return new Response(JSON.stringify(result));

  }
  else {
    //plans api
    var zip_code = body.zip_code
    try {
      var fips_code = zip_to_fips[zip_code]

    } catch (error) {
      return new Response("zip code not found in mapping")
    }
    var api_url = new URL(`${process.env.PLANS_COLLECTION_URL!}?fips_code=${fips_code}`);

    var api_req_start_time = Date.now()
    const response = await fetch(api_url, {
      method: "get",
      headers: { "X-API-TOKEN": token },
    });

    var result = await response.json();

    var api_req_end_time = Date.now()
    var api_time = (api_req_end_time - api_req_start_time) / 1000
    console.log(`api time = ${api_time} seconds`)

    var result_list = []
    try {
      for (var i = 0; i < result.length; i++) {

        result[i]["details"]["star_ratings"] = ""
        if (result[i]["part_c"] != null)
          if (result[i]["part_c"]["details"] != null)
            if (result[i]["part_c"]["details"] != null)
              if (result[i]["part_c"]["details"]["additional_supplemental_benefits"] != null)
                result[i]["part_c"]["details"]["additional_supplemental_benefits"]["other_benefits"] = ""

        if (result[i]["part_d"] != null)
          if (result[i]["part_d"]["details"] != null) {
            result[i]["part_d"]["details"]["drug_tiers"] = ""
            result[i]["part_d"]["details"]["abstract_benefits"] = ""
          }
        // result[i]["package_benefits"]=""
        var str_rating = result[i]["overall_star_rating"]
        var rating = parseFloat(str_rating)
        if ((result[i]["contract_year"] >= 2024) && (rating > 0.0))
          result_list.push([rating, result[i]])
      }

      result_list.sort(function (a, b) {
        return a[0] - b[0];
      });

      for (var i = 0; i < result_list.length; i++) {
        result_list[i] = result_list[i][1]
      }


      let x = Object.entries(result_list);
      let y = x.slice(0, 40);
      const obj = Object.fromEntries(y);
      console.log(`total time = ${(Date.now() - api_req_start_time) / 1000} seconds`)
      return new Response(JSON.stringify(obj));

    } catch (error) {
      console.log(error)
      return new Response(JSON.stringify(error));

    }
  }


};