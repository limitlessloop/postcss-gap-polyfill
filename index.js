import postcss from "postcss";

function guttersProp(decl) {
	const childSelector = " > *";
	const slottedSelector = " > ::slotted(*)";
	const originalRule = decl.parent;
	const originalMargin = postcss.rule({selector: originalRule.selector});
	const originalBefore = postcss.rule({selector: originalRule.selector + ":before"});
	const originalAfter = postcss.rule({selector: originalRule.selector + ":after"});
	const levelTwoRule = postcss.rule({selector: originalRule.selector + childSelector});
	const levelTwoSlotted = postcss.rule({selector: originalRule.selector + slottedSelector});
	const levelTwoMargin = postcss.rule({selector: originalRule.selector + childSelector});
	const levelTwoMarginSlotted = postcss.rule({selector: originalRule.selector + slottedSelector});
	const levelThreeRule = postcss.rule({selector: originalRule.selector + childSelector + childSelector});

	const percentage = decl.value.match(/[\d\.]+%/g);

	// Add new rules
	originalRule.before(levelTwoRule);
	originalRule.before(levelTwoSlotted);
	levelTwoRule.before(levelThreeRule);
	originalRule.before(originalBefore);
	originalRule.before(originalAfter);
	originalRule.after(levelTwoMargin);
	originalRule.after(levelTwoMarginSlotted);
	levelTwoMargin.after(originalMargin);

	if (percentage) {
		levelTwoRule.append(
			`--p-gutters: initial !important;`
		);
		levelTwoSlotted.append(
			`--p-gutters: initial !important;`
		);
		originalRule.append(
			`--p-gutters: calc(var(--width) * var(--gutters));`
		);
	}

	decl.before(
		`--gutters: ${decl.value}!important`
	);

	originalRule.append(
		`--parent-gutters: initial;`
	);

	originalMargin.append(
		`margin-top: calc(var(--parent-gutters, 0px) - var(--p-gutters, var(--gutters, 0px))) !important;
		 margin-left: calc(var(--parent-gutters, 0px) - var(--p-gutters, var(--gutters, 0px))) !important;`
	);

	originalBefore.append(
		`content: ' ';
		 display: table;
		 width: 0;`
	);

	originalAfter.append(
		`content: ' ';
		 display: table;
		 width: 0;`
	);

	levelThreeRule.append(
		`--child-gutters: initial;
		 --parent-gutters: initial;
		 --neg-gutters: initial;`
	);

	levelTwoRule.append(
		`--gutters: initial;
		 --child-gutters: ${decl.value}!important;
		 --parent-gutters: ${decl.value}!important;
		 --neg-gutters: calc(var(--gutters, 0px) - var(--child-gutters, 0px)) !important;`
	);

	levelTwoSlotted.append(
		`--gutters: initial;
		 --child-gutters: ${decl.value}!important;
		 --parent-gutters: ${decl.value};
		 --neg-gutters: calc(var(--gutters, 0px) - var(--child-gutters, 0px)) !important;`
	);

	levelTwoMargin.append(
		`margin-top: var(--child-gutters, 0px);
		 margin-left: var(--child-gutters, 0px);`
	);
	levelTwoMarginSlotted.append(
		`margin-top: var(--child-gutters, 0px) !important;
		 margin-left: var(--child-gutters, 0px) !important;`
	);

	originalRule.walk(i => { delete i.raws.before });
	originalMargin.walk(i => { delete i.raws.before });
	originalBefore.walk(i => { delete i.raws.before });
	originalAfter.walk(i => { delete i.raws.before });
	levelTwoRule.walk(i => { delete i.raws.before });
	levelTwoSlotted.walk(i => { delete i.raws.before });
	levelTwoMargin.walk(i => { delete i.raws.before });
	levelTwoMarginSlotted.walk(i => { delete i.raws.before });
	levelThreeRule.walk(i => { delete i.raws.before });

	decl.remove();

}

function gutterLengthProp(decl) {
	const childSelector = " > *";
	const originalRule = decl.parent;
	const levelTwoRule = postcss.rule({selector: originalRule.selector + childSelector});

	// Add new rules
	originalRule.before(levelTwoRule);

	let percentage = decl.value.match(/[\d\.]+%/g);
	let length = decl.value.match(/[\d\.]+\w+/g);
	let prop = decl.prop;

	if (percentage) {
		let number = decl.value.replace(/\%/g, "");
		decl.before(
			`--${prop}: ${number / 100};
			${prop}: calc(${decl.value} + var(--neg-gutters, var(--gutters, 0px)) - var(--p-gutters, 0px));`
		);
		levelTwoRule.append(
			`--${prop}: initial;`
		);
		originalRule.walk(i => {i.raws.before = "\n\t";});
		levelTwoRule.walk(i => {i.raws.before = "\n\t";});
		decl.remove();
	}
	else if (length) {
		decl.before(
			`${prop}: calc(${decl.value} + var(--gutters, 0px))`
		);
		originalRule.walk(i => {i.raws.before = "\n\t";});
		levelTwoRule.walk(i => {i.raws.before = "\n\t";});
		decl.remove();
	}
}

export default postcss.plugin("postcss-gutters", () => {

	return function (css) {

		css.walkDecls(function (decl) {
			if (decl.prop === "width" || decl.prop === "height") {
				gutterLengthProp(decl);
			}
			if (decl.prop === "gutters") {
				guttersProp(decl);
			}
		});
	};
});
