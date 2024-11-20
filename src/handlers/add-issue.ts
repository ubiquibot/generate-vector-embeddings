import { Context } from "../types";
import { removeFootnotes } from "./issue-deduplication";

export async function addIssue(context: Context<"issues.opened">) {
  const {
    logger,
    adapters: { supabase },
    payload,
  } = context;
  const markdown = payload.issue.body + " " + payload.issue.title || null;
  const authorId = payload.issue.user?.id || -1;
  const nodeId = payload.issue.node_id;
  const isPrivate = payload.repository.private;

  try {
    if (!markdown) {
      logger.error("Issue body is empty");
      return;
    }
    const cleanedIssue = removeFootnotes(markdown);
    await supabase.issue.createIssue(nodeId, payload, isPrivate, cleanedIssue, authorId);
  } catch (error) {
    if (error instanceof Error) {
      logger.error(`Error creating issue:`, { error: error, stack: error.stack });
      throw error;
    } else {
      logger.error(`Error creating issue:`, { err: error, error: new Error() });
      throw error;
    }
  }

  logger.ok(`Successfully created issue!`);
  logger.debug(`Exiting addIssue`);
}
