# Merge Helm Charts

A GitHub action to merge helm chart content from one directory to another.

Right now two types of items can be merge:

- `yaml file`: will be merged be rule of comment blocks
- `directory`: will be replaced by the source directory

## Usage

```yml
      - uses: aisensiy/merge-helm-charts
        with:
          source-path: "source/helm-charts"
          destination-path: "target/helm-charts"
          merge-yamls: "values.yaml,questions.yaml"
          merge-directories: "templates/openbayes_console"
```

### Action inputs

| Name | Description | Default |
| --- | --- | --- |
| `source-path` | (**required**) Source path of helm charts. | |
| `destination-path` | (**required**) Target path of helm charts. | |
| `merge-yamls` | (**required**) Target yaml files, separate by comma or newline. | values.yaml |
| `merge-directories` | (**required**) Target directories, separate by comma or newline. | |

### Outputs

No outputs

## License

MIT License - see the [LICENSE](LICENSE) file for details
