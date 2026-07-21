const prisma = require('../config/db');
const { logAdminAction } = require('./admin-product.service'); // Reuse logger

const getSettings = async () => {
    const settings = await prisma.systemSetting.findMany();
    // Convert array to object for easier consumption
    const settingsMap = {};
    settings.forEach(s => {
        settingsMap[s.key] = s.value;
    });
    return settingsMap;
};

const updateSetting = async (adminId, key, value) => {
    const existing = await prisma.systemSetting.findUnique({ where: { key } });
    
    const setting = await prisma.systemSetting.upsert({
        where: { key },
        update: { value: String(value) },
        create: { key, value: String(value) }
    });

    await logAdminAction(adminId, 'UPDATE_SETTING', 'SystemSetting', setting.id, { value: existing?.value }, { value: String(value) });
    return setting;
};

module.exports = { getSettings, updateSetting };
