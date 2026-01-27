CREATE TABLE [shortLink] (
	[slug] varchar(6) NOT NULL,
	[longLink] text NOT NULL,
	CONSTRAINT [shortLink_slug_key] UNIQUE([slug])
);
