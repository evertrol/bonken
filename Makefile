#all: $(TSSOURCES) $(HTMLSOURCE) $(CSSSOURCES)
#	$(COMPILER) -t ES6 $(TSSOURCES)
#	$(JSSOURCES) $(CSSSOURCES)

all: bonken-scores.html bonken-scores.ts bonken-scores.css
	tsc -t ES2016 bonken-scores
	inliner bonken-scores.html > bonken-scores.min.html
