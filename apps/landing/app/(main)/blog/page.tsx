import Background from "../../components/background";
import Navbar from "../../components/navbar";
import Footer from "../../components/footer";
import FadeIn from "../../components/FadeIn";
import Link from "next/link";
import { ArrowRight, CalendarIcon, Clock } from "lucide-react";
import { BlogSidebar } from "@/app/components/blog/sidebar";
import { calculateReadingTime } from "@/app/lib/blog-utils";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getAllPublishedPosts, getAllCategories, getAllTags } from "./actions";
import { BlogPost, BlogCategory, BlogTag } from "@/app/lib/blog-types";
import { Metadata } from "next";

export const revalidate = 3600; // Revalidate every hour (ISR)

export const metadata: Metadata = {
  title: "Blog | Databuddy Analytics",
  description: "Explore our latest articles, tutorials, and insights about data analytics, privacy, and web analytics.",
  keywords: "data analytics, web analytics, privacy, blog, tutorials, insights",
  openGraph: {
    title: "Blog | Databuddy Analytics",
    description: "Explore our latest articles, tutorials, and insights about data analytics, privacy, and web analytics.",
    type: "website",
    url: "/blog",
  },
};

export default async function BlogPage() {
  // Fetch blog posts, categories, and tags in parallel
  const [posts, categories, tags] = await Promise.all([
    getAllPublishedPosts(),
    getAllCategories(),
    getAllTags()
  ]);

  const formatDate = (date: Date | string) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    }).format(date instanceof Date ? date : new Date(date))
  }

  const getInitials = (name: string | null) => {
    if (!name) return '?'
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2)
  }

  return (
    <div className="fixed inset-0 overflow-hidden">
      <Background />
      <div className="relative z-10 h-full overflow-auto scrollbar-hide">
        <Navbar />
        <main className="container mx-auto px-4 py-16">
          <FadeIn>
            <div className="text-center mb-16">
              <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-sky-400 to-blue-500 mb-4">
                Databuddy Blog
              </h1>
              <p className="text-lg text-slate-300 max-w-2xl mx-auto">
                Insights, updates, and articles about privacy-first analytics, 
                data ownership, and maximizing your website performance.
              </p>
            </div>
          </FadeIn>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Main Content */}
            <div className="lg:col-span-8">
              <FadeIn delay={100}>
                {posts.length > 0 ? (
                  <div className="space-y-12">
                    {posts.map((post: BlogPost) => {
                      const readingTime = calculateReadingTime(post.content);
                      
                      return (
                        <article key={post.id} className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden">
                          {post.coverImage && (
                            <div className="relative w-full h-[300px]">
                              <img 
                                src={post.coverImage} 
                                alt={post.title} 
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}
                          
                          <div className="p-6 md:p-8">
                            <div className="flex flex-wrap gap-2 mb-4">
                              {post.categories.length > 0 && (
                                <Link key={post.categories[0].id} href={`/blog/category/${post.categories[0].slug}`}>
                                  <Badge variant="outline" className="hover:bg-slate-800 transition-colors cursor-pointer">
                                    {post.categories[0].name}
                                  </Badge>
                                </Link>
                              )}
                            </div>
                            
                            <Link href={`/blog/${post.slug}`}>
                              <h2 className="text-2xl md:text-3xl font-bold text-white mb-4 hover:text-sky-400 transition-colors">
                                {post.title}
                              </h2>
                            </Link>
                            
                            {post.excerpt && (
                              <p className="text-slate-300 mb-6">
                                {post.excerpt}
                              </p>
                            )}
                            
                            <div className="flex flex-wrap items-center justify-between gap-4 text-sm text-slate-400">
                              <div className="flex items-center gap-4">
                                {/* Author */}
                                <div className="flex items-center gap-2">
                                  <Avatar className="h-8 w-8">
                                    {post.author.image ? (
                                      <AvatarImage src={post.author.image} alt={post.author.name || 'Author'} />
                                    ) : null}
                                    <AvatarFallback>{getInitials(post.author.name)}</AvatarFallback>
                                  </Avatar>
                                  <span>{post.author.name || 'Anonymous'}</span>
                                </div>
                                
                                {/* Date */}
                                <div className="flex items-center gap-1">
                                  <CalendarIcon className="h-4 w-4" />
                                  <span>{formatDate(post.createdAt)}</span>
                                </div>
                                
                                {/* Reading Time */}
                                <div className="flex items-center gap-1">
                                  <Clock className="h-4 w-4" />
                                  <span>{readingTime} min read</span>
                                </div>
                              </div>
                              
                              <Link 
                                href={`/blog/${post.slug}`}
                                className="flex items-center text-sky-400 hover:text-sky-300 transition-colors"
                              >
                                Read more
                                <ArrowRight className="h-4 w-4 ml-1" />
                              </Link>
                            </div>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                ) : (
                  <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-8 text-center">
                    <div className="flex flex-col items-center justify-center space-y-4">
                      <div className="h-16 w-16 bg-sky-500/20 rounded-full flex items-center justify-center">
                        <Clock className="h-8 w-8 text-sky-400" />
                      </div>
                      <h2 className="text-2xl font-semibold text-white">Coming Soon</h2>
                      <p className="text-slate-300 max-w-lg">
                        We&apos;re working on some amazing content for our blog. Check back soon for insights on privacy-first analytics and data ownership.
                      </p>
                    </div>
                  </div>
                )}
              </FadeIn>
            </div>
            
            {/* Sidebar */}
            <div className="lg:col-span-4">
              <FadeIn delay={150}>
                <div className="sticky top-24">
                  <BlogSidebar
                    recentPosts={posts.slice(0, 5)}
                    categories={categories}
                    tags={tags}
                  />
                </div>
              </FadeIn>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
} 