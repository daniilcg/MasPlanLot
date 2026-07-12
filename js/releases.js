/** Fetch latest GitHub Release assets for MasPlanLot public repo. */
(function () {
  function normalizeTag(tag) {
    return String(tag || '').replace(/^v/i, '');
  }

  function matchAssets(assets) {
    const links = { crm: { win: null, mac: null }, cad: { win: null, mac: null } };
    for (const asset of assets || []) {
      const name = asset.name || '';
      const url = asset.browser_download_url;
      if (!links.crm.win && /MasPlanLot\.?CRM.*Setup.*\.exe$/i.test(name)) links.crm.win = url;
      if (!links.crm.mac && /MasPlanLot\.?CRM.*mac\.dmg$/i.test(name)) links.crm.mac = url;
      if (!links.cad.win && /MasPlanLot\.?CAD.*Setup.*\.exe$/i.test(name)) links.cad.win = url;
      if (!links.cad.mac && /MasPlanLot\.?CAD.*mac\.dmg$/i.test(name)) links.cad.mac = url;
    }
    return links;
  }

  window.fetchMasPlanLotReleaseDownloads = async function fetchMasPlanLotReleaseDownloads() {
    const cfg = window.MASPLANLOT_CONFIG || {};
    const rel = cfg.RELEASES || {};
    const apiUrl =
      rel.apiLatest ||
      'https://api.github.com/repos/daniilcg/MasPlanLot/releases/latest';

    const res = await fetch(apiUrl, {
      headers: { Accept: 'application/vnd.github+json' },
    });
    if (!res.ok) throw new Error('GitHub releases API failed');
    const data = await res.json();
    const links = matchAssets(data.assets);
    return {
      version: normalizeTag(data.tag_name),
      tag: data.tag_name,
      crm: links.crm,
      cad: links.cad,
    };
  };
})();
