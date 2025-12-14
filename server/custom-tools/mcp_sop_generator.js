export default {
  name: "MCP_SOP_Generator",
  description: "Generate SOPs using the external MCP server (your JB MCP Server)",
  icon: "🛠️",

  params: {
    topic: {
      type: "string",
      required: true,
      description: "The SOP topic or title to generate"
    }
  },

  async run({ topic }) {
    try {
      const response = await fetch("https://automation.jesseboudreau.com/webhook/mcp-test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "generate_sop", topic })
      });

      const data = await response.json();
      return {
        success: true,
        sop: data.message || data
      };

    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
};
