/**
 * SERVICE — pure business logic. No MCP, no transport, no I/O. Just functions.
 * This is what you unit-test directly and what the tool handler calls.
 *
 * Example op: slugify + word count. Replace with your own pure logic.
 */

export function slugify(text: string): string {
    return text
        .normalize("NFKD")
        .replace(/[̀-ͯ]/g, "") // strip accents
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
}

export function wordCount(text: string): number {
    const trimmed = text.trim();
    return trimmed ? trimmed.split(/\s+/).length : 0;
}
