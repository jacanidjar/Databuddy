import { Metadata } from 'next';
import Background from '@/app/components/background';
import Navbar from '@/app/components/navbar';
import Footer from '@/app/components/footer';
import FadeIn from '@/app/components/FadeIn';
import { Separator } from '@/components/ui/separator';
import { getAllPublishedPosts, getAllCategories, getAllTags, getRecentPosts } from '../actions';
import { PostGrid } from '@/app/components/blog/post-grid';
import { BlogSidebar } from '@/app/components/blog/sidebar';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'All Blog Posts | Databuddy Analytics',
  description: 'Browse all articles and insights about privacy-first analytics, web performance, and data collection best practices.',
  alternates: {
    canonical: 'https://www.databuddy.cc/blog/archive',
  },
};

// Set ISR revalidation
export const revalidate = 3600; // Revalidate every hour



export default async function ArchivePage({ params }: { params: Promise<{ page?: string }> }) {
  // Get current page from query params, default to 1
  const { page } = await params;
  const currentPage = Number(page) || 1;
  const postsPerPage = 8;
  
  // Fetch all data in parallel
  const [allPosts, categories, tags, recentPosts] = await Promise.all([
    getAllPublishedPosts(),
    getAllCategories(),
    getAllTags(),
    getRecentPosts(5)
  ]);
  
  // Calculate pagination
  const totalPosts = allPosts.length;
  const totalPages = Math.ceil(totalPosts / postsPerPage);
  
  // Get posts for current page
  const startIndex = (currentPage - 1) * postsPerPage;
  const endIndex = startIndex + postsPerPage;
  const paginatedPosts = allPosts.slice(startIndex, endIndex);
  
  // Generate page links
  const getPageLink = (pageNum: number) => {
    return `/blog/archive${pageNum > 1 ? `?page=${pageNum}` : ''}`;
  };
  
  return (
    <div className="fixed inset-0 overflow-hidden">
      <Background />
      <div className="relative z-10 h-full overflow-auto scrollbar-hide">
        <Navbar />
        
        <main className="container mx-auto px-4 py-12 md:py-16 max-w-6xl">
          <FadeIn>
            <div className="mb-8">
              <div className="flex items-center mb-4">
                <Button asChild variant="ghost" className="flex items-center gap-1 text-sky-400 hover:text-sky-300 hover:bg-sky-500/10 -ml-2">
                  <Link href="/blog">
                    <ChevronLeft className="h-4 w-4" />
                    Back to Blog
                  </Link>
                </Button>
              </div>
              
              <h1 className="text-3xl md:text-4xl font-bold">All Blog Posts</h1>
              <p className="text-slate-400 mt-2">
                Browse all {totalPosts} article{totalPosts !== 1 ? 's' : ''} from our blog
              </p>
            </div>
            
            <Separator className="mb-8 bg-slate-800/50" />
            
            <div className="grid grid-cols-1 lg:grid-cols-16 gap-8 lg:gap-16">
              {/* Main Content */}
              <div className="lg:col-span-11">
                {paginatedPosts.length > 0 ? (
                  <>
                    <PostGrid posts={paginatedPosts} />
                    
                    {/* Pagination controls */}
                    {totalPages > 1 && (
                      <div className="flex justify-center mt-12">
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            disabled={currentPage <= 1}
                            className={`border-slate-700 bg-slate-800/50 hover:bg-slate-800 h-9 w-9 p-0 ${
                              currentPage <= 1 ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                            asChild={currentPage > 1}
                          >
                            {currentPage > 1 ? (
                              <Link href={getPageLink(currentPage - 1)}>
                                <ChevronLeft className="h-4 w-4" />
                              </Link>
                            ) : (
                              <ChevronLeft className="h-4 w-4" />
                            )}
                          </Button>
                          
                          {/* Page numbers */}
                          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                            // Show pages around current page
                            let pageNum;
                            if (totalPages <= 5) {
                              pageNum = i + 1;
                            } else if (currentPage <= 3) {
                              pageNum = i + 1;
                            } else if (currentPage >= totalPages - 2) {
                              pageNum = totalPages - 4 + i;
                            } else {
                              pageNum = currentPage - 2 + i;
                            }
                            
                            return (
                              <Button
                                key={pageNum}
                                variant="outline"
                                className={pageNum === currentPage
                                  ? 'border-sky-500/30 bg-sky-500/10 text-sky-400 h-9 w-9 p-0'
                                  : 'border-slate-700 bg-slate-800/50 hover:bg-slate-800 h-9 w-9 p-0'
                                }
                                asChild={pageNum !== currentPage}
                              >
                                {pageNum !== currentPage ? (
                                  <Link href={getPageLink(pageNum)}>
                                    {pageNum}
                                  </Link>
                                ) : (
                                  pageNum
                                )}
                              </Button>
                            );
                          })}
                          
                          <Button
                            variant="outline"
                            disabled={currentPage >= totalPages}
                            className={`border-slate-700 bg-slate-800/50 hover:bg-slate-800 h-9 w-9 p-0 ${
                              currentPage >= totalPages ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                            asChild={currentPage < totalPages}
                          >
                            {currentPage < totalPages ? (
                              <Link href={getPageLink(currentPage + 1)}>
                                <ChevronRight className="h-4 w-4" />
                              </Link>
                            ) : (
                              <ChevronRight className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-slate-400">No posts found.</p>
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
          </FadeIn>
        </main>
        
        <Footer />
      </div>
    </div>
  );
} 