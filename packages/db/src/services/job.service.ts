import { prisma } from '../client';
import { Prisma, JobListing, JobApplication, ApplicationStatus } from '../client';
import { createLogger } from '@databuddy/logger';
// import { cacheable } from '@databuddy/redis';

const logger = createLogger('job-service');

type JobListingWithApplications = JobListing & {
  applications: JobApplication[];
};

export class JobService {
  // Job Listing Methods
  static async createListing(data: Prisma.JobListingCreateInput) {
    try {
      return await prisma.jobListing.create({ data });
    } catch (error) {
      logger.error('Failed to create job listing', { error });
      throw error;
    }
  }

  static findListingById = /*cacheable(*/async (id: string): Promise<JobListingWithApplications | null> => {
    try {
      return await prisma.jobListing.findUnique({
        where: { id },
        include: {
          applications: true,
        },
      });
    } catch (error) {
      logger.error('Failed to find job listing', { error, id });
      throw error;
    }
  }/*)*/;

  static findPublishedListings = /*cacheable(*/async (): Promise<JobListing[]> => {
    try {
      return await prisma.jobListing.findMany({
        where: { 
          published: true,
          closedAt: null
        },
        orderBy: { publishedAt: 'desc' },
      });
    } catch (error) {
      logger.error('Failed to find published job listings', { error });
      throw error;
    }
  }/*)*/;

  static findAllListings = /*cacheable(*/async (): Promise<JobListingWithApplications[]> => {
    try {
      return await prisma.jobListing.findMany({
        include: {
          applications: true,
        },
        orderBy: { createdAt: 'desc' },
      });
    } catch (error) {
      logger.error('Failed to find all job listings', { error });
      throw error;
    }
  }/*)*/;

  static async updateListing(id: string, data: Prisma.JobListingUpdateInput) {
    try {
      const listing = await prisma.jobListing.update({
        where: { id },
        data,
        include: {
          applications: true,
        },
      });
      // Invalidate caches
      // await JobService.findListingById.invalidate(id);
      // await JobService.findPublishedListings.invalidate();
      // await JobService.findAllListings.invalidate();
      return listing;
    } catch (error) {
      logger.error('Failed to update job listing', { error, id });
      throw error;
    }
  }

  static async publishListing(id: string) {
    try {
      const listing = await prisma.jobListing.update({
        where: { id },
        data: {
          published: true,
          publishedAt: new Date(),
        },
      });
      // Invalidate caches
      // await JobService.findListingById.invalidate(id);
      // await JobService.findPublishedListings.invalidate();
      // await JobService.findAllListings.invalidate();
      return listing;
    } catch (error) {
      logger.error('Failed to publish job listing', { error, id });
      throw error;
    }
  }

  static async closeListing(id: string) {
    try {
      const listing = await prisma.jobListing.update({
        where: { id },
        data: {
          closedAt: new Date(),
        },
      });
      // Invalidate caches
      // await JobService.findListingById.invalidate(id);
      // await JobService.findPublishedListings.invalidate();
      // await JobService.findAllListings.invalidate();
      return listing;
    } catch (error) {
      logger.error('Failed to close job listing', { error, id });
      throw error;
    }
  }

  static async deleteListing(id: string) {
    try {
      const listing = await prisma.jobListing.delete({
        where: { id },
      });
      // Invalidate caches
      // await JobService.findListingById.invalidate(id);
      // await JobService.findPublishedListings.invalidate();
      // await JobService.findAllListings.invalidate();
      return listing;
    } catch (error) {
      logger.error('Failed to delete job listing', { error, id });
      throw error;
    }
  }

  // Job Application Methods
  static async createApplication(data: Prisma.JobApplicationCreateInput) {
    try {
      const application = await prisma.jobApplication.create({ data });
      // Invalidate listing caches since application count changed
      // await JobService.findListingById.invalidate(application.jobListingId);
      // await JobService.findAllListings.invalidate();
      return application;
    } catch (error) {
      logger.error('Failed to create job application', { error });
      throw error;
    }
  }

  static findApplicationById = /*cacheable(*/async (id: string): Promise<JobApplication | null> => {
    try {
      return await prisma.jobApplication.findUnique({
        where: { id },
      });
    } catch (error) {
      logger.error('Failed to find job application', { error, id });
      throw error;
    }
  }/*)*/;

  static findApplicationsByListing = /*cacheable(*/async (jobListingId: string): Promise<JobApplication[]> => {
    try {
      return await prisma.jobApplication.findMany({
        where: { jobListingId },
        orderBy: { createdAt: 'desc' },
      });
    } catch (error) {
      logger.error('Failed to find job applications by listing', { error, jobListingId });
      throw error;
    }
  }/*)*/;

  static async updateApplicationStatus(id: string, status: ApplicationStatus) {
    try {
      const application = await prisma.jobApplication.update({
        where: { id },
        data: {
          status,
          reviewedAt: status !== ApplicationStatus.NEW ? new Date() : undefined,
        },
      });
      // Invalidate caches
      // await JobService.findApplicationById.invalidate(id);
      // await JobService.findApplicationsByListing.invalidate(application.jobListingId);
      // await JobService.findListingById.invalidate(application.jobListingId);
      // await JobService.findAllListings.invalidate();
      return application;
    } catch (error) {
      logger.error('Failed to update job application status', { error, id });
      throw error;
    }
  }

  static async deleteApplication(id: string) {
    try {
      const application = await prisma.jobApplication.delete({
        where: { id },
      });
      // Invalidate caches
      // await JobService.findApplicationById.invalidate(id);
      // await JobService.findApplicationsByListing.invalidate(application.jobListingId);
      // await JobService.findListingById.invalidate(application.jobListingId);
      // await JobService.findAllListings.invalidate();
      return application;
    } catch (error) {
      logger.error('Failed to delete job application', { error, id });
      throw error;
    }
  }
} 