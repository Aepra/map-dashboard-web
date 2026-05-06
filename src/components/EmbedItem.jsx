import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Copy, CheckCircle2, ChevronRight } from 'lucide-react';

const copyToClipboard = (text) => {
  navigator.clipboard.writeText(text);
};

export const EmbedItem = ({ title, description, path, embedUrl, icon: Icon, color, lightColor, accentColor }) => {
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [copiedIframe, setCopiedIframe] = useState(false);
  const [showCode, setShowCode] = useState(false);

  const handleCopyUrl = () => {
    copyToClipboard(embedUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const iframeCode = `<iframe src="${embedUrl}" width="100%" height="600" frameborder="0" allow="fullscreen"></iframe>`;

  const handleCopyIframe = () => {
    copyToClipboard(iframeCode);
    setCopiedIframe(true);
    setTimeout(() => setCopiedIframe(false), 2000);
  };

  return (
    <div className="group bg-white rounded-2xl border border-gray-200/60 overflow-hidden hover:border-gray-300 hover:shadow-lg transition-all duration-300">
      {/* Top Color Bar */}
      <div className={`h-1 bg-gradient-to-r ${color}`} />

      {/* Main Content */}
      <div className="p-8">
        {/* Header with Icon */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-start gap-4 flex-1">
            <div className={`${lightColor} p-3 rounded-xl`}>
              <Icon className={`w-6 h-6 ${accentColor}`} />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900">{title}</h3>
              <p className="text-gray-500 text-sm mt-1">{description}</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mb-6">
          <button
            onClick={() => setShowCode(!showCode)}
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-gray-900 to-gray-800 hover:from-gray-800 hover:to-gray-700 text-white font-semibold rounded-xl transition-all duration-200 shadow-md hover:shadow-lg active:scale-95"
          >
            Embed
            <ChevronRight size={18} />
          </button>
          <NavLink
            to={path}
            className="px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-900 font-semibold rounded-xl transition-all duration-200"
          >
            Open Dashboard
          </NavLink>
        </div>

        {/* Code Section - Expandable */}
        {showCode && (
          <div className="space-y-4 pt-6 border-t border-gray-200/60">
            {/* URL Embed Box */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-3 uppercase tracking-wider">
                URL
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={embedUrl}
                  readOnly
                  className="w-full px-4 py-3 bg-gray-50/80 border border-gray-200 rounded-lg text-gray-700 text-sm focus:outline-none focus:bg-white focus:border-gray-400 focus:ring-2 focus:ring-gray-400/20 transition-all duration-200 font-mono pr-12"
                />
                <button
                  onClick={handleCopyUrl}
                  className={`absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-md transition-all duration-200 ${
                    copiedUrl
                      ? 'bg-green-100 text-green-700'
                      : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {copiedUrl ? (
                    <CheckCircle2 size={18} />
                  ) : (
                    <Copy size={18} />
                  )}
                </button>
              </div>
            </div>

            {/* Iframe Box */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-3 uppercase tracking-wider">
                Embed Code
              </label>
              <div className="relative">
                <textarea
                  value={iframeCode}
                  readOnly
                  rows="3"
                  className="w-full px-4 py-3 bg-gray-50/80 border border-gray-200 rounded-lg text-gray-700 text-xs focus:outline-none focus:bg-white focus:border-gray-400 focus:ring-2 focus:ring-gray-400/20 transition-all duration-200 resize-none font-mono"
                />
                <button
                  onClick={handleCopyIframe}
                  className={`absolute right-3 bottom-3 p-2 rounded-md transition-all duration-200 ${
                    copiedIframe
                      ? 'bg-green-100 text-green-700'
                      : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {copiedIframe ? (
                    <CheckCircle2 size={18} />
                  ) : (
                    <Copy size={18} />
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmbedItem;
