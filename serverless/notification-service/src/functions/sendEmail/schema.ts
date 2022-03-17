export default {
  type: "object",
  properties: {
    name: {
      type: 'string'
    },
    message: {
      type: 'string'
    },
    subject: {
      type: 'string'
    }
  },
  required: ['name','message', 'subject']
} as const;
