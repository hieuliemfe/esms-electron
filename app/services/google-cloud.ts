import { Storage, GetSignedUrlConfig } from '@google-cloud/storage';

export const GCS_EVIDENCE_CLIENT_EMAIL =
  'evidence-streaming-service@emotion-detection-project-2020.iam.gserviceaccount.com';
export const GCS_EVIDENCE_PRIVATE_KEY =
  '-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDFfUCENvtp3ABy\n5WkbtWEkyb56BDbddJaFpKVjAHrg2vMP+GVw0jI+fKteJ5lj08CUsEHUnFTNKiUr\nHE7++BekU1mSgOBIz24YwLgd3myC/qxcPtzChd7vJIBkkWQvvfqPG3eROaU57iMe\ni2IMn8vMlB4SUdfFUV5U4Z0AceOtkMKHhV8vlpKCH/nnIgyt+3czJsaIQYFmD3CT\nEj1ymKhCZz8cUnh9zHxluN5VWxtabIh2vb7CotNZCjiP7xwdBhy6EMXdus/5sV4k\nDRs2A6SfF7Vpvv9M2qxNnN2Uz762JS2HAbD7gRv5PYsW2JrqIOZ2p9HAuzyU68C6\n19r2+GUTAgMBAAECggEABHEsrcWJDQ31NtlGYEwtIU/tRMX/t0LP+GAGQMHvc2f8\n6hHTCPaBZiVOLQc2U7YrRt6vnij67DdazKuNj1NII/cWNM262jMS5o6FY+Pvb8pr\nWPZ95yRuKdXEdf6iUNHtrhMIpK+1zkJTjJDjl16oVMHLQEEgko5o+8Y6eUVPa9Oj\ngZcyp1xbOdk+SvUsfX374vOtC+yoP0CJP+teM40R9JEBt6E4hMV/BTN3A8bJuaWq\nMBvVobtMt3nI1rIqIQfinwYZYvvWOQAjE8Apq6guoRBO1L+V6qSrzyqc7b0g1/Vx\nBNuUBD6L5mXJuIuGfHDebBS5I79KHeZaPT62keDruQKBgQDnLb/AHY/LejH/B2oT\n7zr0Z+Nwy9avewgH78eKc2QeyG8mx2fbv+oB51jWaR3LyzrqZYvgHXejp4Ei1Mi5\nycEzqCBY5aLZ5A4JicDztH5qq6NRYWDgqOthY+fEee8LI8uhrO/56aHCJqIznZz4\nvylEBNLk+0JuriQdGIfIThuDrQKBgQDasYEd4hftGt+7+P4XvBCP6DmhGS+cAGN/\nowLIBjhsjpV2Z6njE7Xw3ooPCinK5qcZ0CnUap4EH6DrMkhp/Y3LQRbZkmdKNGkZ\n2Lx6+R+QX6iCGvlMY9jeiUUWa227MqF3YnwTwpCKTc7cWIqWWGLnzZ3pi1/R/3ly\nbAWpPUKjvwKBgQCULmbypgA91R2m8wGztWx8rPrEmmQKJzqGm9OzkzNh5+gXW0nf\nOayte7Ud+lL3BlXFWUHHbhv58qx7vxjKvd/xVJsnYEp6kAvPYVUk4VUG2u3chCas\n2pnF21v8PIxU/6TPBSLtdiwRXuIpY6Xya9Xvm4fy7nsupsDPRaIDas2IIQKBgFGx\nFtsz1t4yOLs94qS5ErK++7AK+Xbbyk8mdGaFtFQQ2xIU3Sg+96rXZlkB4eSyTl9d\nHBMGFKrTqcfRy60UEwCG+uMhRkY4173Y8Wc6YikLIqYfL1ryvVM7kbwzOxU/b4Nq\nHZFAD8AqGojC5loNAD042LEh6BRIy3QLl/3FLXx/AoGAEXDO6ilPOXsJ9FNlAwbd\ng7MXhZKdYRelZAi6bd/qVHJS6WEYyTYQw3agrVkxjon4eayydNOkatxU3kkPLTrO\n+Wfy9Dca9pmXzeoWC+dJ3qsFLD3bGgfG2XV3QA9xoaY3wJdh7dCH8rKqyzbkxxaB\nwFqw9gIs/D0Q06Wu//S1bxY=\n-----END PRIVATE KEY-----\n';
export const GCS_EVIDENCE_PROJECT_ID = 'emotion-detection-project-2020';
export const GCS_EVIDENCE_BUCKET_NAME = 'evidence_stream';

let STORAGE: Storage | null = null;

export const getStorage = (): Storage => {
  if (!STORAGE) {
    STORAGE = new Storage({
      credentials: {
        client_email: GCS_EVIDENCE_CLIENT_EMAIL,
        private_key: GCS_EVIDENCE_PRIVATE_KEY,
      },
      projectId: GCS_EVIDENCE_PROJECT_ID,
    });
  }
  return STORAGE;
};

export const generateV4ReadSignedUrl = async (filePath: string) => {
  const storage = getStorage();
  const options: GetSignedUrlConfig = {
    version: 'v4',
    action: 'read',
    expires: Date.now() + 86400000,
  };
  const [url] = await storage
    .bucket(GCS_EVIDENCE_BUCKET_NAME)
    .file(filePath)
    .getSignedUrl(options);
  console.log(`Generated GET signed URL for filePath (${filePath}): ${url}`);
  return url;
};
