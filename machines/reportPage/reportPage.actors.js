import { fromPromise } from "xstate";
import { decryptDataFromByteArray } from "../../lib/cryptoUtils";

export const fetchReportData = fromPromise(async ({ input }) => {
  const { mode, key, threadId, authorId, messageIndex } = input;
  const isModeForm = mode === "form";

  if (isModeForm && !messageIndex) throw new Error("Missing message index");

  const messageParam = isModeForm ? `&messageIndex=${messageIndex}` : "";

  const response = await fetch(
    `/api/download?threadId=${threadId}&authorId=${authorId}${messageParam}`,
  );
  const data = await response.json();

  if (!response.ok) throw new Error(data.error);

  if (isModeForm) {
    const message = data.messages[0];

    if (!message.metadata?.isReport) throw new Error("Not a report message");

    const reportData = await decryptDataFromByteArray(key, message.data);

    return {
      teamName: data.threadTitle,
      reportData,
      isReadOnly: data.isCreator || reportData.status === "submitted",
    };
  }

  return { teamName: data.threadTitle };
});
