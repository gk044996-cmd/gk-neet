import re

file_path = r"c:\Users\gk044\OneDrive\Desktop\gk-neet\frontend\src\components\Leaderboard.jsx"

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace top3 names with premium badge
content = re.sub(
    r'<h3 className="text-2xl font-bold mb-1 truncate px-2">\{top3\[1\]\.name\}</h3>',
    r'<h3 className="text-2xl font-bold mb-1 truncate px-2">{top3[1].name} {top3[1].isPremium && <span className="inline-flex items-center justify-center w-5 h-5 ml-1 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 text-white text-xs shadow-md" title="Premium User">⭐</span>}</h3>',
    content
)

content = re.sub(
    r'<h3 className="text-3xl font-black mb-1 truncate px-2">\{top3\[0\]\.name\}</h3>',
    r'<h3 className="text-3xl font-black mb-1 truncate px-2">{top3[0].name} {top3[0].isPremium && <span className="inline-flex items-center justify-center w-6 h-6 ml-2 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 text-white text-xs shadow-md" title="Premium User">⭐</span>}</h3>',
    content
)

content = re.sub(
    r'<h3 className="text-2xl font-bold mb-1 truncate px-2">\{top3\[2\]\.name\}</h3>',
    r'<h3 className="text-2xl font-bold mb-1 truncate px-2">{top3[2].name} {top3[2].isPremium && <span className="inline-flex items-center justify-center w-5 h-5 ml-1 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 text-white text-xs shadow-md" title="Premium User">⭐</span>}</h3>',
    content
)

# Replace rest table name
replacement = """                    <td className="px-6 py-5 font-bold text-slate-800 dark:text-white flex items-center">
                      {user.name}
                      {user.isPremium && <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-gradient-to-r from-amber-400 to-orange-500 text-white shadow-sm" title="Premium User">PREMIUM</span>}
                    </td>"""

content = re.sub(
    r'<td className="px-6 py-5 font-bold text-slate-800 dark:text-white">\s*\{user\.name\}\s*</td>',
    replacement,
    content
)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
