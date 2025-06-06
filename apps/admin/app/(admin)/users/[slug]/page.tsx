import { getUserBySlug, getUserAnalytics } from "../actions";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertCircle,
  BadgeCheck,
  Building2,
  Calendar,
  Globe,
  Mail,
  Shield,
  ShieldAlert,
  ShieldCheck,
  User,
  UserCog,
  Webhook,
  LineChart,
} from "lucide-react";
import { format } from "date-fns";
import { UserActions, RoleActions } from "./user-actions";
import { DomainActions } from "./domain-actions";
import { WebsiteActions } from "./website-actions";
import { AddDomainForm } from "./add-domain-form";
import { AddWebsiteForm } from "./add-website-form";
import { Analytics } from "./analytics";

interface UserWithRelations {
  id: string;
  name: string | null;
  email: string;
  emailVerified: boolean;
  image: string | null;
  firstName: string | null;
  lastName: string | null;
  status: 'ACTIVE' | 'SUSPENDED' | 'INACTIVE';
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  role: 'ADMIN' | 'USER' | 'EARLY_ADOPTER' | 'INVESTOR' | 'BETA_TESTER' | 'GUEST';
  twoFactorEnabled: boolean | null;
  domains: Array<{
    id: string;
    name: string;
    verificationStatus: 'PENDING' | 'VERIFIED' | 'FAILED';
    verifiedAt: string | null;
    createdAt: string;
  }>;
  websites: Array<{
    id: string;
    name: string | null;
    domain: string;
    status: 'ACTIVE' | 'HEALTHY' | 'UNHEALTHY' | 'INACTIVE' | 'PENDING';
    createdAt: string;
  }>;
  projects: Array<{
    id: string;
    name: string;
    slug: string;
    type: 'WEBSITE' | 'MOBILE_APP' | 'DESKTOP_APP' | 'API';
    status: 'ACTIVE' | 'COMPLETED' | 'ON_HOLD' | 'CANCELLED';
    createdAt: string;
  }>;
}

export default async function UserProfilePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { user, error } = await getUserBySlug(slug);

  if (error || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Error</h1>
          <p className="mt-2 text-gray-600">{error || "User not found"}</p>
        </div>
      </div>
    );
  }

  const userData = user as unknown as UserWithRelations;

  return (
    <div className="container mx-auto py-8">
      <div className="grid gap-6">
        {/* User Info Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={userData.image || undefined} alt={userData.name || "User"} />
                  <AvatarFallback>{userData.name?.[0] || "U"}</AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-2xl">{userData.name || "Unnamed User"}</CardTitle>
                  <CardDescription className="text-base">{userData.email}</CardDescription>
                </div>
              </div>
              <UserActions user={userData} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <div className="flex items-center gap-2">
                <Badge variant={userData.emailVerified ? "default" : "secondary"} className="gap-1">
                  {userData.emailVerified ? (
                    <>
                      <BadgeCheck className="h-3.5 w-3.5" />
                      Verified
                    </>
                  ) : (
                    <>
                      <AlertCircle className="h-3.5 w-3.5" />
                      Unverified
                    </>
                  )}
                </Badge>
                <Badge variant={userData.status === "ACTIVE" ? "default" : "destructive"} className="gap-1">
                  {userData.status === "ACTIVE" ? (
                    <>
                      <ShieldCheck className="h-3.5 w-3.5" />
                      Active
                    </>
                  ) : (
                    <>
                      <ShieldAlert className="h-3.5 w-3.5" />
                      {userData.status}
                    </>
                  )}
                </Badge>
                {userData.role !== "USER" && (
                  <Badge variant="default" className="gap-1">
                    <Shield className="h-3.5 w-3.5" />
                    {userData.role === 'ADMIN' ? 'Admin' : 
                     userData.role === 'EARLY_ADOPTER' ? 'Early Adopter' :
                     userData.role === 'INVESTOR' ? 'Investor' :
                     userData.role === 'BETA_TESTER' ? 'Beta Tester' :
                     userData.role === 'GUEST' ? 'Guest' : 
                     userData.role}
                  </Badge>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>Joined {format(new Date(userData.createdAt), "MMMM d, yyyy")}</span>
                </div>
                {userData.twoFactorEnabled && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Shield className="h-4 w-4" />
                    <span>2FA Enabled</span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="domains" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="domains" className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              Domains ({userData.domains.length})
            </TabsTrigger>
            <TabsTrigger value="websites" className="flex items-center gap-2">
              <Webhook className="h-4 w-4" />
              Websites ({userData.websites.length})
            </TabsTrigger>
            <TabsTrigger value="projects" className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Projects ({userData.projects.length})
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <LineChart className="h-4 w-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <UserCog className="h-4 w-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="domains">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Domains</CardTitle>
                    <CardDescription>Manage user's domains and DNS settings</CardDescription>
                  </div>
                  <AddDomainForm userId={userData.id} />
                </div>
              </CardHeader>
              <CardContent>
                {userData.domains.length > 0 ? (
                  <div className="grid gap-4">
                    {userData.domains.map((domain) => (
                      <div key={domain.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <Globe className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <div className="font-medium">{domain.name}</div>
                            <div className="text-sm text-muted-foreground">
                              Added {format(new Date(domain.createdAt), "MMM d, yyyy")}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge variant={
                            domain.verificationStatus === "VERIFIED" ? "default" :
                            domain.verificationStatus === "PENDING" ? "secondary" : "destructive"
                          } className="gap-1">
                            {domain.verificationStatus === "VERIFIED" ? (
                              <>
                                <BadgeCheck className="h-3 w-3" />
                                Verified
                              </>
                            ) : domain.verificationStatus === "PENDING" ? (
                              <>
                                <AlertCircle className="h-3 w-3" />
                                Pending
                              </>
                            ) : (
                              <>
                                <AlertCircle className="h-3 w-3" />
                                Failed
                              </>
                            )}
                          </Badge>
                          <DomainActions domain={domain} />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Globe className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Domains Found</h3>
                    <p className="text-muted-foreground mb-4">
                      This user hasn't added any domains yet.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="websites">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Websites</CardTitle>
                    <CardDescription>Manage user's websites and deployments</CardDescription>
                  </div>
                  <AddWebsiteForm userId={userData.id} />
                </div>
              </CardHeader>
              <CardContent>
                {userData.websites.length > 0 ? (
                  <div className="grid gap-4">
                    {userData.websites.map((website) => (
                      <div key={website.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <Webhook className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <div className="font-medium">{website.name || website.domain}</div>
                            <div className="text-sm text-muted-foreground">
                              {website.domain} • Added {format(new Date(website.createdAt), "MMM d, yyyy")}
                              {website.domainId && (
                                <span className="text-xs text-blue-600 ml-2">↗ Linked to domain</span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge variant={
                            website.status === "HEALTHY" ? "default" :
                            website.status === "ACTIVE" ? "secondary" :
                            website.status === "PENDING" ? "secondary" : "destructive"
                          } className="gap-1">
                            {website.status === "HEALTHY" ? (
                              <>
                                <BadgeCheck className="h-3.5 w-3.5" />
                                Healthy
                              </>
                            ) : website.status === "ACTIVE" ? (
                              <>
                                <ShieldCheck className="h-3.5 w-3.5" />
                                Active
                              </>
                            ) : website.status === "PENDING" ? (
                              <>
                                <AlertCircle className="h-3.5 w-3.5" />
                                Pending
                              </>
                            ) : (
                              <>
                                <ShieldAlert className="h-3.5 w-3.5" />
                                {website.status}
                              </>
                            )}
                          </Badge>
                          <WebsiteActions website={website} />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Webhook className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Websites Found</h3>
                    <p className="text-muted-foreground mb-4">
                      This user hasn't added any websites yet.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="projects">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Projects</CardTitle>
                    <CardDescription>Manage user's projects and access</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {userData.projects.length > 0 ? (
                  <div className="grid gap-4">
                    {userData.projects.map((project) => (
                      <div key={project.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <Building2 className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <div className="font-medium">{project.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {project.type} • Added {format(new Date(project.createdAt), "MMM d, yyyy")}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge variant={
                            project.status === "ACTIVE" ? "default" :
                            project.status === "COMPLETED" ? "secondary" :
                            project.status === "ON_HOLD" ? "secondary" : "destructive"
                          } className="gap-1">
                            {project.status === "ACTIVE" ? (
                              <>
                                <BadgeCheck className="h-3.5 w-3.5" />
                                Active
                              </>
                            ) : project.status === "COMPLETED" ? (
                              <>
                                <ShieldCheck className="h-3.5 w-3.5" />
                                Completed
                              </>
                            ) : project.status === "ON_HOLD" ? (
                              <>
                                <AlertCircle className="h-3.5 w-3.5" />
                                On Hold
                              </>
                            ) : (
                              <>
                                <ShieldAlert className="h-3.5 w-3.5" />
                                Cancelled
                              </>
                            )}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Building2 className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Projects Found</h3>
                    <p className="text-muted-foreground mb-4">
                      This user hasn't created any projects yet.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Analytics</CardTitle>
                    <CardDescription>View user's analytics data and event tracking</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Analytics data={await getUserAnalytics(userData.id)} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Account Settings</CardTitle>
                    <CardDescription>Manage user's account settings and preferences</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Mail className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <div className="font-medium">Email Verification</div>
                        <div className="text-sm text-muted-foreground">
                          Status: {userData.emailVerified ? "Verified" : "Unverified"}
                        </div>
                      </div>
                    </div>
                    <Badge variant={userData.emailVerified ? "default" : "secondary"} className="gap-1">
                      {userData.emailVerified ? (
                        <>
                          <BadgeCheck className="h-3.5 w-3.5" />
                          Verified
                        </>
                      ) : (
                        <>
                          <AlertCircle className="h-3.5 w-3.5" />
                          Unverified
                        </>
                      )}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Shield className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <div className="font-medium">Two-Factor Authentication</div>
                        <div className="text-sm text-muted-foreground">
                          Status: {userData.twoFactorEnabled ? "Enabled" : "Disabled"}
                        </div>
                      </div>
                    </div>
                    <Badge variant={userData.twoFactorEnabled ? "default" : "secondary"} className="gap-1">
                      {userData.twoFactorEnabled ? (
                        <>
                          <BadgeCheck className="h-3.5 w-3.5" />
                          Enabled
                        </>
                      ) : (
                        <>
                          <AlertCircle className="h-3.5 w-3.5" />
                          Disabled
                        </>
                      )}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <User className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <div className="font-medium">Account Role</div>
                        <div className="text-sm text-muted-foreground">
                          Current role: {userData.role}
                        </div>
                      </div>
                    </div>
                    <RoleActions user={userData} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
} 