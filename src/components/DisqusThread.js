import React from 'react';
import PropTypes from 'prop-types';

const SHORTNAME = 'freemap';
// const WEBSITE_URL = 'http://local.freemap.sk';

function renderDisqus() {
  if (window.DISQUS === undefined) {
    const script = document.createElement('script');
    script.async = true;
    script.src = `//${SHORTNAME}.disqus.com/embed.js`;
    document.getElementsByTagName('head')[0].appendChild(script);
  } else {
    window.DISQUS.reset({ reload: true });
  }
}

export default class DisqusThread extends React.Component {
  static propTypes = {
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    path: PropTypes.string.isRequired,
  };

  componentDidMount() {
    renderDisqus();
  }

  shouldComponentUpdate(nextProps) {
    return this.props.id !== nextProps.id ||
      this.props.title !== nextProps.title ||
      this.props.path !== nextProps.path;
  }

  componentDidUpdate() {
    renderDisqus();
  }

  render() {
    const { id, title, path, ...other } = this.props;

    if (process.env.BROWSER) {
      window.disqus_shortname = SHORTNAME;
      window.disqus_identifier = id;
      window.disqus_title = title;
      window.disqus_url = /* WEBSITE_URL +*/ path;
    }

    return <div {...other} id="disqus_thread" />;
  }
}
