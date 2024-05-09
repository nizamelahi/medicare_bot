import fetch from "node-fetch";

export const apicall = async (req: Request) => {


  // sending request to the api
  const body = await req.json();
  if (body.plan_id) {
    var api_url = new URL(`${process.env.PLAN_ENTITY_URL!}${body.plan_id}`);
    var token = process.env.X_API_TOKEN!
    const response = await fetch(api_url, {
      method: "get",
      headers: { "X-API-TOKEN": token },
    });

    var result = await response.json();
    return new Response(JSON.stringify(result));

  }
  else {

    var api_url = new URL(`${process.env.PLANS_COLLECTION_URL!}?fips_code=${body.fips_code}`);
    var token = process.env.X_API_TOKEN!
    const response = await fetch(api_url, {
      method: "get",
      headers: { "X-API-TOKEN": token },
    });

    var result = await response.json();
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
        var str_total = result[i]["details"]["annual_breakdown_total"]
        var total = parseInt(str_total)
        if (total > 0)
          result_list.push([total, result[i]])
      }

      result_list.sort(function (a, b) {
        return a[0] - b[0];
      });

      for (var i = 0; i < result_list.length; i++) {
        result_list[i] = result_list[i][1]
      }


      let x = Object.entries(result_list);
      let y = x.slice(0, 80);
      const obj = Object.fromEntries(y);

      return new Response(JSON.stringify(obj));

    } catch (error) {
      console.log(error)
      return new Response(JSON.stringify(error));

    }
  }


};