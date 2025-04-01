import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Background from '@/app/components/background';
import Navbar from '@/app/components/navbar';
import Footer from '@/app/components/footer';
import { getAllCategories, getPostsByCategory, getRecentPosts, getAllTags } from '../../actions';
import { BlogSidebar } from '@/app/components/blog/sidebar';
import { PostGrid } from '@/app/components/blog/post-grid';
import { Separator } from '@/components/ui/separator';
import { BlogCategory } from '@/app/lib/blog-types';

export const revalidate = 3600; // Revalidate every hour (ISR)

// Generate static params for all categories
export async function generateStaticParams() {
  const categories = await getAllCategories();
  return categories.map((category) => ({
    slug: category.slug,
  }));
}

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const categories = await getAllCategories();
  const category = categories.find(cat => cat.slug === slug);
  
  if (!category) {
    return {
      title: 'Category Not Found | Databuddy',
      description: 'The requested category could not be found.'
    };
  }
  
  return {
    title: `${category.name} | Databuddy Blog`,
    description: `Browse all posts in the ${category.name} category.`,
    alternates: {
      canonical: `https://www.databuddy.cc/blog/category/${slug}`,
    },
    openGraph: {
      title: `${category.name} | Databuddy Blog`,
      description: `Browse all posts in the ${category.name} category.`,
    }
  };
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  const categories = await getAllCategories();
  const category = categories.find(cat => cat.slug === slug) as BlogCategory;
  
  if (!category) {
    notFound();
  }
  
  // Fetch posts for this category and sidebar data in parallel
  const [posts, recentPosts, tags] = await Promise.all([
    getPostsByCategory(category.id),
    getRecentPosts(5),
    getAllTags()
  ]);
  
  return (
    <div className="fixed inset-0 overflow-hidden">
      <Background />
      <div className="relative z-10 h-full overflow-auto scrollbar-hide font-nunito">
        <Navbar />
        
        <main className="container mx-auto px-4 py-12 md:py-16 max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-16 gap-8 lg:gap-16">
            {/* Main Content */}
            <div className="lg:col-span-11">
              <div className="mb-8">
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                  Category: {category.name}
                </h1>
                <p className="text-slate-400">
                  Showing {posts.length} post{posts.length !== 1 ? 's' : ''} in this category
                </p>
              </div>
              
              <Separator className="mb-8 bg-slate-800/50" />
              
              {posts.length > 0 ? (
                <PostGrid posts={posts} />
              ) : (
                <div className="text-center py-12">
                  <p className="text-slate-400">No posts found in this category.</p>
                </div>
              )}
            </div>
            
            {/* Sidebar */}
            <div className="lg:col-span-5">
              <div className="sticky top-24">
                <BlogSidebar
                  recentPosts={recentPosts}
                  categories={categories}
                  tags={tags}
                />
              </div>
            </div>
          </div>
        </main>
        
        <Footer />
      </div>
    </div>
  );
} 