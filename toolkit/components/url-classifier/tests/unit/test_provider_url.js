const { updateAppInfo } = ChromeUtils.importESModule(
  "resource://testing-common/AppInfo.sys.mjs"
);

function updateVersion(version) {
  updateAppInfo({ version });
}

add_setup(function () {
  // We have to set up this pref since the new Remote Settings pref is not designed to have
  // appVer in its url (Bug 1899359)
  let prefValue = Services.prefs.getCharPref(
    "browser.safebrowsing.provider.mozilla.updateURL"
  );

  if (prefValue.includes("moz-sbrs")) {
    Services.prefs.setCharPref(
      "browser.safebrowsing.provider.mozilla.updateURL",
      "https://shavar.services.mozilla.com/downloads?client=SAFEBROWSING_ID&appver=%MAJOR_VERSION%&pver=2.2"
    );
  }

  registerCleanupFunction(() => {
    Services.prefs.clearUserPref(
      "browser.safebrowsing.provider.mozilla.updateURL"
    );
  });
});

add_test(function test_provider_url() {
  let urls = [
    "browser.safebrowsing.provider.google.updateURL",
    "browser.safebrowsing.provider.google.gethashURL",
    "browser.safebrowsing.provider.mozilla.updateURL",
    "browser.safebrowsing.provider.mozilla.gethashURL",
  ];

  // FIXME: Most of these only worked in the past because calling
  // `updateAppInfo` did not actually replace `Services.appinfo`, which
  // the URL formatter uses.
  // let versions = ["49.0", "49.0.1", "49.0a1", "49.0b1", "49.0esr", "49.0.1esr"];
  let versions = ["49.0", "49.0.1"];

  for (let version of versions) {
    for (let url of urls) {
      updateVersion(version);
      let value = Services.urlFormatter.formatURLPref(url);
      Assert.notEqual(value.indexOf("&appver=49.0&"), -1);
    }
  }

  run_next_test();
});
