import { fromPromise } from "xstate";
import { decryptDataFromByteArray } from "../../lib/cryptoUtils";

export const fetchReportList = fromPromise(async ({ input }) => {
  const { mode, key, threadId, authorId, reportIndex } = input;
  const isModeForm = mode === "form";

  const messageParam = isModeForm && reportIndex ? `&messageIndex=${reportIndex}` : "";
  const authorParam = isModeForm && !reportIndex ? "" : `&authorId=${authorId}`;

  const response = await fetch(`/api/download?threadId=${threadId}${authorParam}${messageParam}`);
  const data = await response.json();

  if (!response.ok) throw new Error(data.error);

  // Filter and decrypt reports
  const reportList = [];

  for (const message of data.messages) {
    if (!message.metadata?.isReport) continue;

    const content = await decryptDataFromByteArray(key, message.data);

    reportList.push({
      id: message.index,
      timestamp: message.metadata.timestamp || new Date().toISOString(),
      authorId: message.metadata.authorId,
      isCurrentUser: message.metadata.authorId === authorId,
      ...content,
    });
  }

  // Sort reports by timestamp, newest first
  reportList.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  const context = {
    teamName: data.threadTitle,
    reportList,
  };

  if (isModeForm) {
    context.isReadOnly =
      (data.isCreator && !reportList[0]?.isThreadCreator) || reportList[0]?.status === "submitted";
  }

  return context;
});
