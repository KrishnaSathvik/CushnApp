export const BILL_TYPES = {
    subscription: { id: 'subscription', label: 'Subscriptions', color: '#0D9488', icon: 'newspaper', shape: 'circle' },
    utility: { id: 'utility', label: 'Utilities', color: '#F97316', icon: 'zap', shape: 'diamond' },
    loan: { id: 'loan', label: 'Loans', color: '#A78BFA', icon: 'landmark', shape: 'square' },
    insurance: { id: 'insurance', label: 'Insurance', color: '#60A5FA', icon: 'shield', shape: 'shield' },
}

export const BILL_TYPE_LIST = Object.entries(BILL_TYPES).map(([key, val]) => ({
    value: key,
    ...val,
}))

export function getBillTypeInfo(type) {
    return BILL_TYPES[type] || BILL_TYPES.subscription
}

function inferBillTypeFromCategoryName(categoryName) {
    const name = (categoryName || '').toLowerCase()
    if (name.includes('utilit')) return 'utility'
    if (name.includes('loan')) return 'loan'
    if (name.includes('insurance')) return 'insurance'
    return 'subscription'
}

function isValidBillType(type) {
    return !!BILL_TYPES[type]
}

function getMappingKey(categoryId) {
    return categoryId == null ? null : String(categoryId)
}

export function getBillTypeByCategoryName(categoryName) {
    return inferBillTypeFromCategoryName(categoryName)
}

export function resolveBillTypeKey({ categoryId = null, categoryName = '', billTypeByCategory = {} } = {}) {
    const mappingKey = getMappingKey(categoryId)
    const mappedType = mappingKey ? billTypeByCategory?.[mappingKey] : null
    if (isValidBillType(mappedType)) return mappedType
    return inferBillTypeFromCategoryName(categoryName)
}
