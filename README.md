# Update Postman Schema from File

A GitHub action to merge helm chart content from one directory to another.

Right now only three parts will be handled:

- `templates/`: all the templates contents in target will be replaced by source/templates
- `values.yaml|yml`: will be merged be rule of comment blocks
- `questions.yaml|yml`: will be merged be rule of comment blocks

## Usage

```yml
      - uses: aisensiy/merge-helm-charts
        with:
          source-path: "source/helm-charts"
          destination-path: "target/helm-charts"
```

### Action inputs

| Name | Description | Default |
| --- | --- | --- |
| `source-path` | (**required**) Source path of helm charts. | |
| `destination-path` | (**required**) Target path of helm charts. | |

### Outputs

No outputs

## License

MIT License - see the [LICENSE](LICENSE) file for details
