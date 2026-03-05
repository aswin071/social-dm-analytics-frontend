const CATEGORY_LABELS = {
  pricing: 'Pricing',
  stock: 'Stock',
  complaint: 'Complaint',
  compliment: 'Compliment',
  purchase_intent: 'Purchase Intent',
  general: 'General',
}

export default function CategoryBadge({ category }) {
  return (
    <span className={`badge badge-${category}`}>
      {CATEGORY_LABELS[category] || category}
    </span>
  )
}
