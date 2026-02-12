import { createUploadthing, type FileRouter } from "uploadthing/next";
import { auth } from "@/auth";
import { Role } from "@prisma/client";

const f = createUploadthing();

export const ourFileRouter = {
    pdfUploader: f({ pdf: { maxFileSize: "1MB", maxFileCount: 1 } })
        .middleware(async () => {
            const session = await auth();

            if (!session?.user || session.user.role !== Role.ADMIN_CABOR) {
                throw new Error("Unauthorized: Only Cabor admin can upload files.");
            }

            return { userId: session.user.id };
        })
        .onUploadComplete(async ({ metadata, file }) => {
            console.log("Upload complete for userId:", metadata.userId);
            console.log("File URL:", file.ufsUrl);

            return { url: file.ufsUrl, name: file.name };
        }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
