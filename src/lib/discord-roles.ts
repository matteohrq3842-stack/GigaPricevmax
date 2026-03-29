export const DISCORD_ROLES = {
  // --- SPECIAL / BOTS ---
  CROSS: { id: '1446582422744469604', name: '⨻', color: '#95A5A6', priority: 0 },
  GIGAPRICE_BOT: { id: '1446886999146369098', name: '💸 GigaPrice', color: '#9B59B6', priority: 0 },
  GIVEAWAY_BOT: { id: '1455951858739707985', name: 'GiveawayBot', color: '#FF7675', priority: 0 },
  ARCANE: { id: '1446586872531779677', name: 'Arcane', color: '#3498DB', priority: 0 },
  STATBOT: { id: '1446586970842333227', name: 'Statbot', color: '#2ECC71', priority: 0 },
  LUNABOT: { id: '1446622796141822235', name: 'LunaBot 🌙', color: '#F1C40F', priority: 0 },
  TICKET_TOOL: { id: '1446639564616634561', name: 'Ticket Tool', color: '#E74C3C', priority: 0 },
  DISBOARD: { id: '1450870219408019632', name: 'DISBOARD.org', color: '#3498DB', priority: 0 },
  
  // --- STYLES (Colors) ---
  STYLE_ROSE: { id: '1456790555098087466', name: 'GP Style • Rose', color: '#FF69B4', priority: 10 },
  STYLE_VERT: { id: '1457824463860269058', name: 'GP Style • Vert', color: '#2ECC71', priority: 10 },
  STYLE_BLEU_CIEL: { id: '1457114548694941859', name: 'GP Style • Bleu ciel', color: '#87CEEB', priority: 10 },
  STYLE_ORANGE: { id: '1456791018119893033', name: 'GP Style • Orange', color: '#E67E22', priority: 10 },
  STYLE_BLEU: { id: '1456790961211310315', name: 'GP Style • Bleu', color: '#3498DB', priority: 10 },

  // --- ADMINISTRATION (SUPER ADMINS) ---
  FOUNDER: { id: '1446582422744469602', name: '👑・Fondateur', color: '#E67E22', priority: 100 },
  KEY_ADMIN: { id: '1446582422744469601', name: '🔑', color: '#E67E22', priority: 99 },
  CO_FOUNDER: { id: '1446582422744469600', name: '👑・Co Fondateur', color: '#E67E22', priority: 95 },
  DEVELOPER: { id: '1449168195226439843', name: '🧑🏽‍💻 ・Développeur', color: '#3498DB', priority: 90 },
  SERVER_MANAGEMENT: { id: '1449167872868749352', name: '🏅・Serveur Management', color: '#9B59B6', priority: 85 },
  
  // --- MANAGEMENT & STAFF ---
  RECRUITER: { id: '1446582422744469597', name: '⚰️▸Recruteur', color: '#E74C3C', priority: 65 },
  DIRECTION: { id: '1446582422727819436', name: '🔱▸Direction', color: '#E74C3C', priority: 80 },
  COMMERCIAL: { id: '1460699709357428736', name: '💼・Commercial', color: '#F1C40F', priority: 75 },
  WEB_MANAGEMENT: { id: '1446582422719303728', name: '🛜▸Web Management', color: '#9B59B6', priority: 80 },
  HARDWARE_MANAGEMENT: { id: '1458905435401752640', name: '💻・Hardware Management', color: '#9B59B6', priority: 80 },
  ADMINISTRATION: { id: '1446582422719303726', name: '⚜️▸Administration', color: '#E74C3C', priority: 75 },
  SECURITY: { id: '1458902669300207707', name: '🔒・Sécurité', color: '#E74C3C', priority: 70 },
  HELPER: { id: '1446582422719303725', name: '🔰▸Helper', color: '#2ECC71', priority: 60 },
  PERM_STAFF: { id: '1446582422744469598', name: 'Perm Staff', color: '#2ECC71', priority: 60 },
  GRIMM: { id: '1458903617514770573', name: 'GRIMM', color: '#95A5A6', priority: 55 },
  
  // --- ROLES SPECIAUX ---
  FRIENDS: { id: '1446582422698328312', name: '🗼・Amis', color: '#E91E63', priority: 50 },
  VIP: { id: '1446638806550839367', name: '💎▸VIP', color: '#3498DB', priority: 45 },
  PREMIUM: { id: '1449154958841745499', name: '🌸▸Premium', color: '#FF69B4', priority: 45 },
  
  // --- NIVEAUX / LEVELING ---
  MEMBER: { id: '1446582422710779960', name: '🎯▸Membre', color: '#3498DB', priority: 20 },
  NOTIFS_PROMO: { id: '1447176575257808916', name: '🔔・Notifs Promo', color: '#E67E22', priority: 15 },
  MATRIXE: { id: '1446582422710779957', name: '❗・Matrixé', color: '#E74C3C', priority: 35 },
  EXPERT: { id: '1446582422710779956', name: '🔰・Expert', color: '#F1C40F', priority: 30 },
  EXPERIMENTE: { id: '1446582422710779955', name: '🧢・Experimenté', color: '#3498DB', priority: 25 },
  BEGINNER: { id: '1446582422710779954', name: '👓・Débutant', color: '#95A5A6', priority: 20 },
  RICH: { id: '1449166647482122401', name: '💶 ・€€', color: '#F1C40F', priority: 15 },
  
  // --- NOTIFICATIONS & UPDATES ---
  UPDATE_PC: { id: '1446873845523808388', name: '💻▸Update Pc', color: '#9B59B6', priority: 5 },
  UPDATE_SWITCH: { id: '1447942543152119911', name: '❤️▸Update Switch', color: '#E74C3C', priority: 5 },
  UPDATE_XBOX: { id: '1447942593886294066', name: '💚▸Update Xbox', color: '#2ECC71', priority: 5 },
  UPDATE_PLAY: { id: '1447942629085020352', name: '💙▸Update Play', color: '#3498DB', priority: 5 },
  DL: { id: '1450887218066624677', name: 'DL', color: '#95A5A6', priority: 5 },
  AQUIIO: { id: '1452831112949928128', name: '🌐・AQUIIO', color: '#3498DB', priority: 5 },
  INSTANT_GAMING: { id: '1459145026134085634', name: 'ActuGame', color: '#E67E22', priority: 5 },
  NOTIFS: { id: '1459146161733632193', name: 'Notifs', color: '#E67E22', priority: 5 },
  PENDING: { id: '1460952071221285015', name: 'En attente', color: '#95A5A6', priority: 1 },
  EVERYONE: { id: '1446582422375370877', name: '@everyone', color: '#FFFFFF', priority: 0 },
};

export const getRoleById = (id: string) => {
  return Object.values(DISCORD_ROLES).find(role => role.id === id);
};

// Check if user has one of the "Super Admin" roles
export const isSuperAdmin = (userRoleIds: string[]) => {
  const superAdminIds = [
    DISCORD_ROLES.FOUNDER.id,
    DISCORD_ROLES.CO_FOUNDER.id,
    DISCORD_ROLES.DEVELOPER.id,
    DISCORD_ROLES.KEY_ADMIN.id, // Added Key Admin
    DISCORD_ROLES.SERVER_MANAGEMENT.id // Added Server Management
  ];
  return userRoleIds.some(id => superAdminIds.includes(id));
};

// Check if user is staff (has access to panel at all)
export const hasPricePanelAccess = (userRoleIds: string[]) => {
  const staffRoleIds = [
    DISCORD_ROLES.FOUNDER.id,
    DISCORD_ROLES.CO_FOUNDER.id,
    DISCORD_ROLES.DEVELOPER.id,
    DISCORD_ROLES.KEY_ADMIN.id,
    DISCORD_ROLES.SERVER_MANAGEMENT.id,
    DISCORD_ROLES.WEB_MANAGEMENT.id,
    DISCORD_ROLES.HARDWARE_MANAGEMENT.id,
    DISCORD_ROLES.SECURITY.id,
    DISCORD_ROLES.PERM_STAFF.id,
    DISCORD_ROLES.DIRECTION.id,
    DISCORD_ROLES.ADMINISTRATION.id,
    DISCORD_ROLES.HELPER.id,
  ];
  return userRoleIds.some(id => staffRoleIds.includes(id));
};

// Check if user is restricted (Cannot see Settings/Legal)
export const isRestrictedStaff = (userRoleIds: string[]) => {
  return hasPricePanelAccess(userRoleIds) && !isSuperAdmin(userRoleIds);
};

// Helper to sort roles by priority
export const sortRolesByPriority = (roles: typeof DISCORD_ROLES[keyof typeof DISCORD_ROLES][]) => {
  return roles.sort((a, b) => b.priority - a.priority);
};

// Get formatted roles for display
export const getUserRolesDisplay = (userRoleIds: string[]) => {
  return Object.values(DISCORD_ROLES)
    .filter(role => userRoleIds.includes(role.id))
    .sort((a, b) => b.priority - a.priority);
};
