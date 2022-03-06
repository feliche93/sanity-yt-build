export default {
  name: 'comment',
  title: 'Comment',
  type: 'document',
  fields: [
    {
      name: 'name',
      title: 'Name',
      description: 'The Name of the person commenting',
      type: 'string',
    },
    {
      name: 'approved',
      title: 'Approved',
      type: 'boolean',
      description: 'Is this comment approved?',
    },
    {
      name: 'email',
      title: 'Email',
      type: 'string',
      description: 'The email of the person commenting',
    },
    {
      name: 'comment',
      title: 'Comment',
      type: 'string',
      description: 'The comment',
    },
    {
      name: 'post',
      type: 'reference',
      to: [{ type: 'post' }],
    },
  ],
}
