import re

file_path = r"c:\Users\gk044\OneDrive\Desktop\gk-neet\backend\routes\userRoutes.js"

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace user object in register
content = re.sub(
    r"user:\s*\{\s*id:\s*user._id,\s*email,\s*username:\s*user\.username,\s*role:\s*user\.role\s*\}",
    "user: { id: user._id, email, username: user.username, role: user.role, isPremium: user.isPremium, premiumPlan: user.premiumPlan, premiumPurchasedAt: user.premiumPurchasedAt, premiumExpiresAt: user.premiumExpiresAt }",
    content
)

# Replace admin user object in login
content = re.sub(
    r"user:\s*\{\s*id:\s*adminUser._id,\s*email:\s*adminUser\.email,\s*username:\s*adminUser\.username,\s*role:\s*'admin'\s*\}",
    "user: { id: adminUser._id, email: adminUser.email, username: adminUser.username, role: 'admin', isPremium: adminUser.isPremium, premiumPlan: adminUser.premiumPlan, premiumPurchasedAt: adminUser.premiumPurchasedAt, premiumExpiresAt: adminUser.premiumExpiresAt }",
    content
)

# Replace profile user object
content = re.sub(
    r"user:\s*\{\s*id:\s*user._id,\s*email:\s*user\.email,\s*username:\s*user\.username,\s*role:\s*user\.role\s*\}",
    "user: { id: user._id, email: user.email, username: user.username, role: user.role, isPremium: user.isPremium, premiumPlan: user.premiumPlan, premiumPurchasedAt: user.premiumPurchasedAt, premiumExpiresAt: user.premiumExpiresAt }",
    content
)

# Leaderboard select
content = content.replace(
    ".select('username email');",
    ".select('username email isPremium');"
)

# Leaderboard map
content = content.replace(
    "_id: user._id,\n        name: user.username,",
    "_id: user._id,\n        name: user.username,\n        isPremium: user.isPremium,"
)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated userRoutes.js")
