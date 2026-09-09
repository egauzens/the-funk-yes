/**
 * Contentful content-model migration for The Funk Yes!
 *
 * Creates every content type the site expects. Run once on a fresh space
 * (contentful-migration does not cleanly re-run against an existing model):
 *
 *   npx contentful-migration \
 *     --space-id   <SPACE_ID> \
 *     --access-token <CMA_TOKEN> \
 *     --environment-id master \
 *     --yes \
 *     contentful/migrate.cjs
 *
 * CMA token = Contentful → Settings → API keys → "Content management tokens"
 * tab → "Generate personal token". Different from the read-only delivery token
 * the site build uses. If the org restricts personal access tokens you may
 * need to approve the token under Organization settings → Security first.
 *
 * CommonJS on purpose — the contentful-migration CLI loads this file with
 * require(), so it must not be an ES module.
 */

module.exports = function (migration) {
  /* ----------------------------- siteContent ---------------------------- */
  const site = migration
    .createContentType("siteContent")
    .name("Site content (singleton)")
    .description("One entry. Editable prose and photos used across the site.")
    .displayField("internalTitle");
  site.createField("internalTitle").name("Internal title").type("Symbol").required(true);
  site.createField("missionStatement").name("Mission statement").type("Symbol").required(true);
  site.createField("heroTagline").name("Hero tagline").type("Symbol").required(true);
  site.createField("bandBioShort").name("Band bio (short)").type("Text").required(true);
  site.createField("bandBioLong").name("Band bio (long)").type("RichText");
  site.createField("bandGroupPhoto").name("Band group photo").type("Link").linkType("Asset");
  site.createField("fuckYesDescription").name("The Fuck Yes! description").type("RichText");
  site.createField("fuckYesPhoto").name("The Fuck Yes! photo").type("Link").linkType("Asset");
  site.createField("bookingBlurb").name("Booking blurb").type("RichText");
  site.createField("funkFilesIntro").name("Funk Files intro").type("Text");

  /* -------------------------------- show ------------------------------- */
  const show = migration
    .createContentType("show")
    .name("Show")
    .description("A gig — powers Funk @ 5 and the home mini-calendar.")
    .displayField("title");
  show.createField("title").name("Title").type("Symbol").required(true);
  show.createField("dateTime").name("Date & time").type("Date").required(true);
  show.createField("venueName").name("Venue name").type("Symbol").required(true);
  show.createField("venueAddress").name("Venue address").type("Symbol");
  show.createField("city").name("City").type("Symbol");
  show.createField("ticketUrl").name("Ticket / info URL").type("Symbol");
  show
    .createField("pricing")
    .name("Pricing")
    .type("Symbol")
    .required(true)
    .validations([{ in: ["Free", "Sliding scale", "Ticketed"] }]);
  show.createField("description").name("Description").type("Text");
  show.createField("flyer").name("Flyer").type("Link").linkType("Asset");
  show
    .createField("status")
    .name("Status")
    .type("Symbol")
    .required(true)
    .validations([{ in: ["Confirmed", "Cancelled", "Sold out"] }]);
  show.changeFieldControl("pricing", "builtin", "dropdown");
  show.changeFieldControl("status", "builtin", "dropdown");

  /* ----------------------------- bandMember --------------------------- */
  const member = migration
    .createContentType("bandMember")
    .name("Band member")
    .displayField("name");
  member.createField("name").name("Name").type("Symbol").required(true);
  member.createField("instrumentRole").name("Instrument / role").type("Symbol").required(true);
  member.createField("shortBio").name("Short bio").type("Text").required(true);
  member.createField("longBio").name("Long bio").type("RichText");
  member.createField("photo").name("Photo").type("Link").linkType("Asset");
  member.createField("order").name("Sort order").type("Integer").required(true);
  member.createField("socials").name("Socials (JSON)").type("Object");

  /* ------------------------------ recording -------------------------- */
  const rec = migration
    .createContentType("recording")
    .name("Recording")
    .description("Audio — powers Funk Files. Media stays on SoundCloud / Bandcamp / Drive.")
    .displayField("title");
  rec.createField("title").name("Title").type("Symbol").required(true);
  rec
    .createField("recordingType")
    .name("Type")
    .type("Symbol")
    .required(true)
    .validations([{ in: ["Practice", "Live", "Studio"] }]);
  rec
    .createField("platform")
    .name("Platform")
    .type("Symbol")
    .required(true)
    .validations([{ in: ["SoundCloud", "Bandcamp", "Google Drive"] }]);
  rec.createField("embedUrlOrId").name("Embed URL or id").type("Symbol").required(true);
  rec.createField("recordedDate").name("Recorded date").type("Date");
  rec.createField("description").name("Description").type("Text");
  rec.createField("featured").name("Feature on home page").type("Boolean");
  rec.changeFieldControl("recordingType", "builtin", "dropdown");
  rec.changeFieldControl("platform", "builtin", "dropdown");
  rec.changeFieldControl("embedUrlOrId", "builtin", "singleLine", {
    helpText:
      "SoundCloud/Drive: paste the share URL. Bandcamp: the numeric album id (or 'track=123').",
  });

  /* ------------------------------ liveVideo -------------------------- */
  const video = migration
    .createContentType("liveVideo")
    .name("Live video")
    .description("Video — powers Live Jam-Funk. Hosted on YouTube / Drive / Instagram.")
    .displayField("title");
  video.createField("title").name("Title").type("Symbol").required(true);
  video
    .createField("platform")
    .name("Platform")
    .type("Symbol")
    .required(true)
    .validations([{ in: ["YouTube", "Google Drive", "Instagram"] }]);
  video.createField("urlOrId").name("URL or id").type("Symbol").required(true);
  video.createField("date").name("Date").type("Date");
  video.createField("description").name("Description").type("Text");
  video.createField("featured").name("Feature on home page").type("Boolean");
  video.changeFieldControl("platform", "builtin", "dropdown");
  video.changeFieldControl("urlOrId", "builtin", "singleLine", {
    helpText: "YouTube: video id or watch URL. Drive: file id/URL. Instagram: post/reel URL.",
  });

  /* -------------------------------- funq ----------------------------- */
  const funq = migration
    .createContentType("funq")
    .name("FUNQ")
    .description("Frequently Unanswered Newbie Question.")
    .displayField("question");
  funq.createField("question").name("Question").type("Symbol").required(true);
  funq.createField("answer").name("Answer").type("RichText").required(true);
  funq.createField("order").name("Sort order").type("Integer").required(true);

  /* ------------------------------- gallery --------------------------- */
  const gallery = migration
    .createContentType("gallery")
    .name("Gallery (optional)")
    .description("A named set of Instagram posts or Drive file ids.")
    .displayField("name");
  gallery.createField("name").name("Name").type("Symbol").required(true);
  gallery
    .createField("source")
    .name("Source")
    .type("Symbol")
    .required(true)
    .validations([{ in: ["Instagram", "Google Drive"] }]);
  gallery.createField("sourceRef").name("Source ref (handle / folder id)").type("Symbol");
  gallery.createField("items").name("Items (JSON list)").type("Object");
};
