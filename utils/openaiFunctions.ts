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
    {
      name: "connect2Agent",
      description : "if the user asks to be connected to an agent or a repersentive or ask about the price of the treatment",
      parameters : {
        type : "object",
        properties: {
          date : {
            type : "string",
            description : "the whole question asked by the user"
          }
        },
        // required : [""]
      }
    }
]

