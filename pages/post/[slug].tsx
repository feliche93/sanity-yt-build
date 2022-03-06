import { GetStaticProps } from 'next'
import React from 'react'
import Header from '../../components/Header'
import { sanityClient, urlFor } from '../../sanity'
import { Post } from '../../typings'
import PortableText from 'react-portable-text'
import { useForm, SubmitHandler } from 'react-hook-form'

interface Props {
  post: Post
}

interface IFormInput {
  _id: string
  name: string
  email: string
  comment: string
}

function BlogPost({ post }: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm()

  const onSubmit: SubmitHandler<IFormInput> = async (data) => {
    console.log(data)
  }

  return (
    <>
      <main>
        <Header />
        <img
          className="h-40 w-full object-cover"
          src={urlFor(post.mainImage).url()!}
          alt=""
        />
        <article className="mx-auto max-w-3xl p-5">
          <h1 className="mt-10 mb-3 text-3xl">{post.title}</h1>
          <h2 className="mb-2 text-xl font-light text-gray-500">
            {post.description}
          </h2>
          <div className="flex items-center space-x-2">
            <img
              className="h-10 w-10 rounded-full"
              src={urlFor(post.author.image).url()!}
              alt=""
            />
            <p className="font-extralighht text-sm">
              Blog post by{' '}
              <span className="text-green-600">{post.author.name}</span> -
              Published at {new Date(post._createdAt).toLocaleString()}
            </p>
          </div>

          <div className="mt-10">
            <PortableText
              dataset={process.env.NEXT_PUBLIC_SANITY_DATSET}
              projectId={process.env.NEXT_PUBLIC_SANITY_PROJECT_ID}
              content={post.body}
              serializers={{
                h1: (props: any) => (
                  <h1 className="my-5 text-2xl font-bold">{props.children}</h1>
                ),
                h2: (props: any) => (
                  <h2 className="my-5 text-xl font-bold">{props.children}</h2>
                ),
                li: (props: any) => (
                  <li className="ml-4 list-disc">{props.children}</li>
                ),
                link: ({ href, children }: any) => (
                  <a href={href} className="text-blue-500 hover:underline">
                    {children}
                  </a>
                ),
              }}
            />
          </div>
          <hr className="my-5 mx-auto max-w-lg border border-yellow-500" />

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="my-10 mx-auto mb-10 flex max-w-2xl flex-col p-5"
          >
            <h3 className="text-sm text-yellow-500">Enjoyed this article?</h3>
            <h4 className="text-3xl font-bold">Leave a comment below!</h4>
            <hr className="mt-2 py-3" />

            <input
              {...register('_id')}
              type="hidden"
              name="_id"
              value={post._id}
            />
            <label className="mb-5 block ">
              <span className="text-grey-700">Name</span>
              <input
                {...register('name', {
                  required: true,
                })}
                className="form-input block w-full rounded border py-2 px-3 shadow outline-none ring-yellow-500 focus:ring-1"
                name="name"
                type="text"
                placeholder="John Appleseed"
              />
            </label>
            <label className="mb-5 block ">
              <span className="text-grey-700">Email</span>
              <input
                {...register('email', {
                  required: true,
                })}
                className="form-input block w-full rounded border py-2 px-3 shadow outline-none ring-yellow-500 focus:ring-1"
                type="email"
                name="email"
                placeholder="john.appleseed@mail.com"
              />
            </label>
            <label className="mb-5 block ">
              <span className="text-grey-700">Comment</span>
              <textarea
                {...register('comment', {
                  required: true,
                })}
                className="form-textarea mt-1 block w-full rounded border py-2 px-3 shadow outline-none ring-yellow-500 focus:ring-1"
                placeholder="Your Commnet"
                name="comment"
                rows={8}
              />
            </label>
            <div className="flex flex-col p-5">
              {errors.name && (
                <span className="text-red-500">
                  - The Name field is required
                </span>
              )}
              {errors.email && (
                <span className="text-red-500">
                  - The Email field is required
                </span>
              )}
              {errors.comment && (
                <span className="text-red-500">
                  - The Comment field is required
                </span>
              )}
            </div>
            <input
              className="focus:shadow-outline cursor-pointer rounded bg-yellow-500 py-2 px-4 font-bold text-white shadow hover:bg-yellow-400 focus:outline-none"
              type="submit"
            />
          </form>
        </article>
      </main>
    </>
  )
}

export default BlogPost

export const getStaticPaths = async () => {
  const query = `
  *[_type == "post"]{
    _id,
    slug {
     current
  }
  }`

  const posts = await sanityClient.fetch(query)

  const paths = posts.map((post: Post) => ({
    params: {
      slug: post.slug.current,
    },
  }))

  return {
    paths,
    fallback: 'blocking',
  }
}

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const query = `*[_type == "post" && slug.current == $slug][0] {
    _id,
    _createdAt,
    author -> {
      name,
      image
    },
    'comments': *[
      _type == "comment" &&
      post._ref == ^._id &&
      approved == true],
    description,
    mainImage,
    title,
    slug,
    body
   }`

  const post = await sanityClient.fetch(query, { slug: params!.slug })

  console.log(post)

  if (Object.entries(post).length === 0) {
    return {
      notFound: true,
    }
  }

  return {
    props: {
      post,
    },
    revalidate: 60,
  }
}
