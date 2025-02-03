package domains

type Domain interface {
	Validate() error
}
