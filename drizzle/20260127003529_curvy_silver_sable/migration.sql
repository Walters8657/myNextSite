CREATE TABLE [shortLink] (
	[shortLink] varchar(6) NOT NULL,
	[longLink] text NOT NULL,
	CONSTRAINT [shortLink_shortLink_key] UNIQUE([shortLink])
);
