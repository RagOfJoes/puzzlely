package puzzle

func (p *Puzzle) Node() Node {
	return Node{
		ID:          p.ID,
		Name:        p.Name,
		Description: p.Description,
		Difficulty:  p.Difficulty,
		MaxAttempts: p.MaxAttempts,
		TimeAllowed: p.TimeAllowed,
		CreatedAt:   p.CreatedAt,
		UpdatedAt:   p.UpdatedAt,
		LikedAt:     p.LikedAt,
		NumOfLikes:  p.NumOfLikes,
		CreatedBy:   p.CreatedBy,
	}
}
