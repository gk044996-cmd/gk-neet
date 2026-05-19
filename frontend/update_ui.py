import re

# 1. Update Dashboard.jsx
dashboard_file = r"c:\Users\gk044\OneDrive\Desktop\gk-neet\frontend\src\pages\Dashboard.jsx"
with open(dashboard_file, 'r', encoding='utf-8') as f:
    content = f.read()

replacement_1 = """                <h3 className="text-xl font-black text-black dark:text-white" style={{ wordWrap: 'break-word', overflowWrap: 'break-word' }}>
                  {test.accessType === 'premium' && <span className="mr-2 inline-flex items-center" title="Premium Test">🔒</span>}
                  {test.title}
                </h3>"""
content = re.sub(r'<h3 className="text-xl font-black text-black dark:text-white" style=\{\{ wordWrap: \'break-word\', overflowWrap: \'break-word\' \}\}>\{test\.title\}</h3>', replacement_1, content)

replacement_2 = """              ) : (
                test.accessType === 'premium' && !currentUser?.isPremium && currentUser?.role !== 'admin' ? (
                  <Link to="/subscription" className="mt-auto block w-full text-center py-3 bg-gradient-to-r from-amber-400 to-orange-500 text-white rounded-xl hover:opacity-90 transition-opacity font-bold shadow-md">
                    🔒 Upgrade to Access
                  </Link>
                ) : (
                  <Link to={`/test/${test._id}`} className="mt-auto block w-full text-center py-3 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors font-semibold">
                    Start Test
                  </Link>
                )
              )}"""

content = re.sub(r'\) : \(\s*<Link to={`/test/\$\{test\._id\}`} className="mt-auto block w-full text-center py-3 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors font-semibold">\s*Start Test\s*</Link>\s*\)\}', replacement_2, content)

with open(dashboard_file, 'w', encoding='utf-8') as f:
    f.write(content)

# 2. Update Navbar.jsx
navbar_file = r"c:\Users\gk044\OneDrive\Desktop\gk-neet\frontend\src\components\Navbar.jsx"
with open(navbar_file, 'r', encoding='utf-8') as f:
    nav_content = f.read()

nav_replacement = """                  {currentUser.isPremium && (
                    <Link to="/subscription" className="hidden md:inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-gradient-to-r from-amber-400 to-orange-500 text-white shadow-sm ml-2 mr-2">
                      ⭐ PREMIUM
                    </Link>
                  )}
                  <span className="text-slate-700 dark:text-slate-200 font-semibold">{currentUser.username}</span>"""

nav_content = re.sub(r'<span className="text-slate-700 dark:text-slate-200 font-semibold">\{currentUser\.username\}</span>', nav_replacement, nav_content)

with open(navbar_file, 'w', encoding='utf-8') as f:
    f.write(nav_content)

# 3. Update Profile.jsx
profile_file = r"c:\Users\gk044\OneDrive\Desktop\gk-neet\frontend\src\pages\Profile.jsx"
with open(profile_file, 'r', encoding='utf-8') as f:
    prof_content = f.read()

prof_replacement = """              </div>
              
              <div className="mt-6 flex flex-col md:flex-row gap-4">
                <div className={`p-4 rounded-xl border ${currentUser?.isPremium ? 'bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200 dark:from-amber-900/20 dark:to-orange-900/20 dark:border-amber-700' : 'bg-slate-50 border-slate-200 dark:bg-slate-800 dark:border-slate-700'} flex-1`}>
                  <h4 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">Subscription Plan</h4>
                  <div className="flex items-center justify-between">
                    <span className={`text-xl font-black ${currentUser?.isPremium ? 'text-orange-600 dark:text-orange-400' : 'text-slate-700 dark:text-slate-300'}`}>
                      {currentUser?.isPremium ? '⭐ PREMIUM' : 'FREE'}
                    </span>
                    {!currentUser?.isPremium && (
                      <Link to="/subscription" className="text-sm font-bold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400">Upgrade &rarr;</Link>
                    )}
                  </div>
                  {currentUser?.isPremium && currentUser?.premiumExpiresAt && (
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
                      Valid till: {new Date(currentUser.premiumExpiresAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
              
              <div className="mt-6 flex items-center justify-between border-t border-slate-100 dark:border-slate-700 pt-6">"""

prof_content = prof_content.replace("""              </div>
              <div className="mt-6 flex items-center justify-between border-t border-slate-100 dark:border-slate-700 pt-6">""", prof_replacement)

with open(profile_file, 'w', encoding='utf-8') as f:
    f.write(prof_content)

print("Updated Dashboard, Navbar and Profile")
