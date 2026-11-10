<?xml version="1.0" encoding="utf-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="html" encoding="utf-8" indent="yes"/>
  <xsl:template match="/rss/channel">
    <html lang="en">
      <head>
        <meta charset="utf-8"/>
        <meta name="viewport" content="width=device-width,initial-scale=1"/>
        <title><xsl:value-of select="title"/> — Web Feed (RSS)</title>
        <link rel="stylesheet" href="./style.css"/>
      </head>
      <body>
        <header>
          <a class="logo" href="./"><xsl:value-of select="title"/></a>
          <nav>
            <a href="./">Home</a>
          </nav>
        </header>
        <main>
          <div class="card" style="margin-top:1.5rem">
            <h1 style="font-size:1.5rem;margin:0 0 .5rem">Web Feed (RSS)</h1>
            <p style="color:var(--mute);margin:0 0 .8rem">
              This is the RSS web feed for <strong><xsl:value-of select="title"/></strong>. If you use a feed reader (like Feedly, Inoreader, or NetNewsWire), copy this page's URL to subscribe.
            </p>
            <p style="margin:0"><a href="./">← Return to Vanguard Brief</a></p>
          </div>
          <h2 style="margin-top:2rem">Recent Posts</h2>
          <xsl:for-each select="item">
            <div class="card">
              <h2><a href="{link}"><xsl:value-of select="title"/></a></h2>
              <p><xsl:value-of select="description"/></p>
              <small><xsl:value-of select="pubDate"/></small>
            </div>
          </xsl:for-each>
        </main>
        <footer>
          © Vanguard Brief · <a href="./">Home</a>
        </footer>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>
