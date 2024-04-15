import React from 'react';
import Markdown from 'react-markdown';

const YOUTUBE_ID_REGEX = new RegExp("(?:youtube\\.com\\/(?:[^\\/]+\\/\\.+\\/|(?:v|e(?:mbed)?)\\/|.*[?&]v=)|youtu\\.be\\/)([^\"&?\\/\\s]{11})");
const VIMEO_ID_REGEX = /(?:https?:\/\/)?(?:www\.)?vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/([^\/]*)\/videos\/|album\/(\d+)\/video\/|video\/|(\d+))(?:\?.*)?/;

// Custom component for rendering YouTube videos
const YouTubeEmbed = ({ videoId }) => (
  <iframe
    className="widget youtube-widget"
    width="560"
    height="315"
    src={`https://www.youtube.com/embed/${videoId}`}
    frameBorder="0"
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
    allowFullScreen
    title="YouTube video player"
  ></iframe>
);

// Custom component for rendering Vimeo videos
const VimeoEmbed = ({ videoId }) => (
  <iframe
    className="widget vimeo-widget"
    src={`https://player.vimeo.com/video/${videoId}`}
    width="640"
    height="360"
    frameBorder="0"
    allow="autoplay; fullscreen"
    allowFullScreen
    title="Vimeo video player"
  ></iframe>
);

// Custom component for rendering SoundCloud tracks
const SoundCloudEmbed = ({ trackUrl }) => (
  <iframe
    className="widget soundcloud-widget"
    width="100%"
    height="166"
    scrolling="no"
    frameBorder="no"
    allow="autoplay"
    src={`https://w.soundcloud.com/player/?url=${encodeURIComponent(trackUrl)}&color=%23ff5500&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true&visual=true`}
    title="SoundCloud embed"
  ></iframe>
);

const renderEmbed = (url) => {
  if (url.match(YOUTUBE_ID_REGEX)) {
    const match = url.match(YOUTUBE_ID_REGEX)[0];
    const videoId = match.split('=')[1];
    return <YouTubeEmbed videoId={videoId} />;
  } else if (url.match(VIMEO_ID_REGEX)) {
    const match = url.match(VIMEO_ID_REGEX)[0];
    const videoId = match[3] || match[2] || match[1];
    return <VimeoEmbed videoId={videoId} />;
  } else if (url.startsWith('https://soundcloud.com/')) {
    return <SoundCloudEmbed trackUrl={url} />;
  }
};

// Custom renderers for react-markdown
const components = {
  p: ({ children }) => {
    let text = undefined;

    if (typeof children === 'string') {

      //if the line is (strictly) a single URL, check if it should not be transformed to a media widget.

      const lines = children.split('\n').map((line, index) => {
        line = line.trim();
        const matches = line.match(/^(https?:\/\/[^\s]+)$/);
        const url = matches && matches[0];
        const widget = url ? renderEmbed(url) : undefined;

        return <React.Fragment key={index}>
          {
            widget ?
            widget :
            line
          }
        </React.Fragment>

      });
      children = lines;
    }

    return <p>{children}</p>; // Render the lines within a container
  },
  /*
  a: ({ href, children }) => {
    const widget = renderEmbed(href);
    if (widget) {
      return widget;
    } else {
      // Default behavior for other links
      return <a href={href}>{children}</a>;
    }
  },
  */
};

const TdpMarkdown = (props) => (
  <>
    <Markdown components={components}>{props.children}</Markdown>
    <xmp>{props.children}</xmp>
  </>
);

export default TdpMarkdown
