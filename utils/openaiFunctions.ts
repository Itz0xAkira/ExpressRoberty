export const functionlist = [
    {
      name: "OrderRequest",
      description : "get the type of Consumables the clinet wants",
      parameters : {
        type : "object",
        properties: {
          Consumables : {
            type : "string",
            description : "the Consumable, e.g cola, chicken nuggets, soda, water, coffee"
          }
        },
        required : ["Consumables"]
      }
    },
    // {
    //   name: "SelfCheckIn",
    //   description : "this function is for any question asked by the user unless it matches something in the functions list",
    //   parameters : {
    //     type : "object",
    //     properties: {
    //       date : {
    //         type : "string",
    //         description : "the whole question asked by the user"
    //       }
    //     },
    //     required : ["date"]
    //   }
    // }
]

